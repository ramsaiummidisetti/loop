import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { generateGeminiText } from "@/lib/gemini";

const reportPeriodSchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
}).refine(
  (data) => data.periodStart <= data.periodEnd,
  {
    message: "Period start must be before or equal to period end.",
    path: ["periodStart"],
  },
);

type ReportStats = {
  totalFeedback: number;
  positive: number;
  neutral: number;
  negative: number;
  positivePercent: number;
  negativePercent: number;
  topThemes: Array<{
    name: string;
    count: number;
  }>;
  quotes: Array<{
    content: string;
    channel: string;
    sentiment: string | null;
  }>;
};

async function buildNarrative(
  stats: ReportStats,
): Promise<string> {
  if (stats.totalFeedback === 0) {
    return "No feedback was recorded during the selected reporting period.";
  }

  const unclassified =
    stats.totalFeedback -
    stats.positive -
    stats.neutral -
    stats.negative;

  const context = `
Total feedback: ${stats.totalFeedback}
Positive: ${stats.positive}
Neutral: ${stats.neutral}
Negative: ${stats.negative}
Unclassified: ${unclassified}
Positive percentage: ${stats.positivePercent}%
Negative percentage: ${stats.negativePercent}%

Top themes:
${
  stats.topThemes.length > 0
    ? stats.topThemes
        .map(
          (theme) =>
            `- ${theme.name}: ${theme.count} feedback items`,
        )
        .join("\n")
    : "- No themes assigned"
}

Representative feedback:
${
  stats.quotes.length > 0
    ? stats.quotes
        .map(
          (quote, index) =>
            `${index + 1}. [${quote.channel}] [${
              quote.sentiment ?? "Unclassified"
            }] ${quote.content}`,
        )
        .join("\n")
    : "- No representative feedback available"
}
`;

  return generateGeminiText(
    `
Generate a concise Voice of Customer report narrative from the supplied feedback data.

DATA:
${context}

Requirements:
- Summarize the overall customer feedback.
- Identify important sentiment patterns.
- Mention significant themes supported by the data.
- Highlight recurring concerns when the representative feedback supports them.
- Mention the number of unclassified feedback items when greater than zero.
- Do not invent facts, causes, trends, or customer opinions.
- Do not make claims that are not supported by the supplied data.
- Do not quote feedback unless necessary.
- Write 2 to 4 concise paragraphs.
    `.trim(),
    {
      systemInstruction:
        "You are LOOP, a Voice of Customer intelligence assistant. Generate factual, evidence-grounded report narratives using only the supplied customer feedback data.",
      temperature: 0.2,
    },
  );
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);

    const body: unknown = await request.json();
    const parsed = reportPeriodSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Invalid report period.",
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const { periodStart, periodEnd } = parsed.data;

    const feedback = await db.feedback.findMany({
      where: {
        workspaceId: session.user.workspaceId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
      select: {
        content: true,
        channel: true,
        sentiment: true,
        sentimentScore: true,
        themes: {
          select: {
            theme: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalFeedback = feedback.length;
    const positive = feedback.filter(
      (item) => item.sentiment === "POS",
    ).length;
    const neutral = feedback.filter(
      (item) => item.sentiment === "NEU",
    ).length;
    const negative = feedback.filter(
      (item) => item.sentiment === "NEG",
    ).length;

    const positivePercent =
      totalFeedback > 0 ? Math.round((positive / totalFeedback) * 100) : 0;

    const negativePercent =
      totalFeedback > 0 ? Math.round((negative / totalFeedback) * 100) : 0;

    const themeCounts = new Map<string, number>();

    for (const item of feedback) {
    for (const feedbackTheme of item.themes) {
        const themeName = feedbackTheme.theme.name;

        themeCounts.set(
        themeName,
        (themeCounts.get(themeName) ?? 0) + 1,
        );
    }
    }

    const topThemes = Array.from(themeCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const quotes = feedback
      .filter((item) => item.content.trim().length > 0)
      .slice(0, 5)
      .map((item) => ({
        content: item.content,
        channel: item.channel,
        sentiment: item.sentiment,
      }));

    const stats: ReportStats = {
      totalFeedback,
      positive,
      neutral,
      negative,
      positivePercent,
      negativePercent,
      topThemes,
      quotes,
    };

    let narrative: string;

        try {
        narrative = await buildNarrative(stats);
        } catch (error) {
        console.error("Gemini report narrative error:", error);

        return NextResponse.json(
            {
            message:
                error instanceof Error
                ? error.message
                : "Gemini report generation failed.",
            },
            { status: 503 },
        );
        }

    const contentJson = {
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      stats,
      narrative,
      recommendedActions:
        negative > 0
          ? [
              "Review the negative feedback items and identify recurring issues.",
              "Prioritize the highest-volume themes for product or support follow-up.",
            ]
          : [
              "Continue monitoring feedback volume and emerging themes.",
              "Review representative feedback for opportunities to improve customer experience.",
            ],
    };

    const report = await db.report.create({
      data: {
        title: `Voice of Customer Report — ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`,
        periodStart,
        periodEnd,
        contentJson,
        workspaceId: session.user.workspaceId,
        generatedBy: session.user.id,
      },
    });

    await createAuditLog({
      action: "CREATE_REPORT",
      entityType: "REPORT",
      entityId: report.id,
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      metadata: {
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        totalFeedback,
      },
    });

    return NextResponse.json(
      {
        id: report.id,
        title: report.title,
        periodStart: report.periodStart,
        periodEnd: report.periodEnd,
        content: contentJson,
        createdAt: report.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins and analysts can generate reports." },
        { status: 403 },
      );
    }

    console.error("Report generation error:", error);

    return NextResponse.json(
      { message: "Unable to generate report." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "ANALYST", "VIEWER"]);

    const reports = await db.report.findMany({
      where: {
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        title: true,
        periodStart: true,
        periodEnd: true,
        createdAt: true,
        generatedBy: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Forbidden." },
        { status: 403 },
      );
    }

    console.error("Report listing error:", error);

    return NextResponse.json(
      { message: "Unable to load reports." },
      { status: 500 },
    );
  }
}