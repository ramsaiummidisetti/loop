import { NextResponse } from "next/server";
import { z } from "zod";
import { generateGeminiText } from "@/lib/gemini";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

const routeParamsSchema = z.object({
  id: z.string().min(1, "Feedback ID is required"),
});

const aiResponseSchema = z.object({
  sentiment: z.enum(["POS", "NEU", "NEG"]),
  score: z.number().min(0).max(1),
});

type SentimentResult = z.infer<typeof aiResponseSchema>;

function generateMockSentiment(
  content: string
): SentimentResult {
  const text = content.toLowerCase().trim();

  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "easy",
    "love",
    "helpful",
    "fast",
    "happy",
    "perfect",
    "best",
  ];

  const negativeWords = [
    "bad",
    "slow",
    "poor",
    "terrible",
    "difficult",
    "hate",
    "worst",
    "problem",
    "issue",
    "broken",
    "late",
  ];

  const positiveCount = positiveWords.filter(
    (word) => text.includes(word)
  ).length;

  const negativeCount = negativeWords.filter(
    (word) => text.includes(word)
  ).length;

  if (positiveCount > negativeCount) {
    return {
      sentiment: "POS",
      score: 0.9,
    };
  }

  if (negativeCount > positiveCount) {
    return {
      sentiment: "NEG",
      score: 0.9,
    };
  }

  return {
    sentiment: "NEU",
    score: 0.5,
  };
}

async function analyzeWithGemini(
  content: string
): Promise<SentimentResult> {
  const response = await generateGeminiText(
    `
Analyze the sentiment of the following customer feedback.

Return exactly this JSON structure:

{
  "sentiment": "POS",
  "score": 0.95
}

Rules:
- sentiment must be exactly POS, NEU, or NEG
- score must be a number between 0 and 1
- score represents confidence
- return only JSON
- do not include markdown
- do not include explanations

Customer feedback:
${content}
    `.trim(),
    {
      systemInstruction:
        "You are a customer feedback sentiment analysis system. Return only valid JSON matching the requested structure.",
      temperature: 0.1,
    }
  );

  let parsed: unknown;

  try {
    parsed = JSON.parse(response);
  } catch {
    throw new Error(
      "Gemini returned invalid JSON"
    );
  }

  const validated =
    aiResponseSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error(
      "Gemini returned an invalid sentiment result"
    );
  }

  return validated.data;
}
export async function POST(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  const result = await requireRole([
    "ADMIN",
    "ANALYST",
  ]);

  if ("error" in result) {
    return result.error;
  }

  try {
    const params = await context.params;

    const validatedParams =
      routeParamsSchema.safeParse(params);

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback ID",
        },
        { status: 400 }
      );
    }

    const feedback =
      await db.feedback.findFirst({
        where: {
          id: validatedParams.data.id,
          workspaceId: result.user.workspaceId,
        },
        select: {
          id: true,
          content: true,
        },
      });

    if (!feedback) {
      return NextResponse.json(
        {
          error: "Feedback not found",
        },
        { status: 404 }
      );
    }

    const aiMode =
      process.env.AI_MODE ?? "mock";

    let sentiment: SentimentResult;

        if (aiMode === "gemini") {
      try {
        sentiment =
          await analyzeWithGemini(
            feedback.content
          );
      } catch (error) {
        console.error(
          "Gemini sentiment analysis error:",
          error
        );

        return NextResponse.json(
          {
            error:
              error instanceof Error
                ? error.message
                : "Unable to analyze sentiment",
          },
          { status: 503 }
        );
      }
    } else {
      sentiment = generateMockSentiment(
        feedback.content
      );
    }

    const updatedFeedback =
        await db.feedback.update({
          where: {
            id: feedback.id,
          },
          data: {
            sentiment: sentiment.sentiment,
            sentimentScore: sentiment.score,
          },
          select: {
            id: true,
            sentiment: true,
            sentimentScore: true,
          },
        });

      await createAuditLog({
        workspaceId: result.user.workspaceId,
        userId: result.user.id,
        action: "ANALYZE_SENTIMENT",
        entityType: "FEEDBACK",
        entityId: updatedFeedback.id,
        metadata: {
          sentiment: updatedFeedback.sentiment,
          sentimentScore: updatedFeedback.sentimentScore,
        },
      });
    return NextResponse.json({
      message:
        aiMode === "gemini"
          ? "Sentiment analyzed with Gemini"
          : "Sentiment analyzed with mock AI",

      feedback: updatedFeedback,
    });
  } catch (error) {
    console.error(
      "Sentiment analysis error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to analyze sentiment",
      },
      { status: 500 }
    );
  }
}