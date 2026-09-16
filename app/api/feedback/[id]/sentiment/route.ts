import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

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

async function analyzeWithClaude(
  content: string
): Promise<SentimentResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Anthropic API key is not configured"
    );
  }

  const anthropic = new Anthropic({
    apiKey,
  });

  const response = await anthropic.messages.create({
    model:
      process.env.ANTHROPIC_MODEL ??
      "claude-haiku-4-5-20251001",

    max_tokens: 100,

    system:
      "You analyze customer feedback sentiment. Return only valid JSON.",

    messages: [
      {
        role: "user",
        content: `
Analyze the sentiment of this customer feedback.

Return exactly this JSON structure:

{
  "sentiment": "POS",
  "score": 0.95
}

Rules:
- sentiment must be POS, NEU, or NEG
- score must be between 0 and 1
- score represents confidence
- do not include markdown
- do not include explanations

Customer feedback:
${content}
        `.trim(),
      },
    ],
  });

  const textBlock = response.content.find(
    (block) => block.type === "text"
  );

  if (!textBlock || textBlock.type !== "text") {
    throw new Error(
      "Claude returned no text response"
    );
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(textBlock.text);
  } catch {
    throw new Error(
      "Claude returned invalid JSON"
    );
  }

  const validated =
    aiResponseSchema.safeParse(parsed);

  if (!validated.success) {
    throw new Error(
      "Claude returned an invalid sentiment result"
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

    if (aiMode === "claude") {
      try {
        sentiment =
          await analyzeWithClaude(
            feedback.content
          );
      } catch (error) {
        console.error(
          "Claude sentiment analysis error:",
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
        aiMode === "claude"
          ? "Sentiment analyzed with Claude"
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