import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

const querySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

type ThemeSummary = {
  name: string;
  count: number;
  averageConfidence: number;
};

type Insight = {
  type: "SENTIMENT" | "THEME" | "VOLUME";
  title: string;
  description: string;
};

type Recommendation = {
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  action: string;
};

export async function GET(request: Request) {
  try {
    const session = await requireRole([
      "ADMIN",
      "ANALYST",
      "VIEWER",
    ]);

    const url = new URL(request.url);

    const validationResult = querySchema.safeParse({
      days: url.searchParams.get("days") ?? "30",
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid query parameters",
          errors: validationResult.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const { days } = validationResult.data;

    const periodStart = new Date();

    periodStart.setDate(periodStart.getDate() - days);

    const feedback = await db.feedback.findMany({
      where: {
        workspaceId: session.user.workspaceId,
        createdAt: {
          gte: periodStart,
        },
      },
      select: {
        id: true,
        content: true,
        sentiment: true,
        sentimentScore: true,
        status: true,
        createdAt: true,
        themes: {
          select: {
            confidence: true,
            theme: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const totalFeedback = feedback.length;

    const positiveCount = feedback.filter(
      (item) => item.sentiment === "POS"
    ).length;

    const neutralCount = feedback.filter(
      (item) => item.sentiment === "NEU"
    ).length;

    const negativeCount = feedback.filter(
      (item) => item.sentiment === "NEG"
    ).length;

    const scoredFeedback = feedback.filter(
      (item) => item.sentimentScore !== null
    );

    const averageSentimentScore =
      scoredFeedback.length > 0
        ? scoredFeedback.reduce(
            (sum, item) =>
              sum + (item.sentimentScore ?? 0),
            0
          ) / scoredFeedback.length
        : null;

    const negativePercentage =
      totalFeedback > 0
        ? (negativeCount / totalFeedback) * 100
        : 0;

    const themeMap = new Map<
      string,
      {
        count: number;
        confidenceTotal: number;
      }
    >();

    for (const item of feedback) {
      for (const feedbackTheme of item.themes) {
        const current = themeMap.get(
          feedbackTheme.theme.name
        ) ?? {
          count: 0,
          confidenceTotal: 0,
        };

        current.count += 1;
        current.confidenceTotal += feedbackTheme.confidence;

        themeMap.set(
          feedbackTheme.theme.name,
          current
        );
      }
    }

    const topThemes: ThemeSummary[] = Array.from(
      themeMap.entries()
    )
      .map(([name, data]) => ({
        name,
        count: data.count,
        averageConfidence:
          data.count > 0
            ? data.confidenceTotal / data.count
            : 0,
      }))
      .sort((first, second) => {
        if (second.count !== first.count) {
          return second.count - first.count;
        }

        return (
          second.averageConfidence -
          first.averageConfidence
        );
      })
      .slice(0, 5);

    const insights: Insight[] = [];

    if (negativeCount > 0) {
      insights.push({
        type: "SENTIMENT",
        title: "Negative feedback detected",
        description: `${negativeCount} of ${totalFeedback} feedback items are negative (${negativePercentage.toFixed(
          1
        )}%).`,
      });
    }

    if (
      totalFeedback > 0 &&
      negativePercentage >= 30
    ) {
      insights.push({
        type: "SENTIMENT",
        title: "Negative sentiment is significant",
        description:
          "At least 30% of the feedback in this period is negative and may require attention.",
      });
    }

    if (positiveCount > negativeCount) {
      insights.push({
        type: "SENTIMENT",
        title: "Positive sentiment leads",
        description: `Positive feedback (${positiveCount}) is higher than negative feedback (${negativeCount}).`,
      });
    }

    if (topThemes.length > 0) {
      const topTheme = topThemes[0];

      insights.push({
        type: "THEME",
        title: `Top theme: ${topTheme.name}`,
        description: `${topTheme.name} appears in ${topTheme.count} feedback item${
          topTheme.count === 1 ? "" : "s"
        } during this period.`,
      });
    }

    if (totalFeedback === 0) {
      insights.push({
        type: "VOLUME",
        title: "No feedback in selected period",
        description:
          "There is no feedback available for the selected time period.",
      });
    } else {
      insights.push({
        type: "VOLUME",
        title: "Feedback volume",
        description: `${totalFeedback} feedback item${
          totalFeedback === 1 ? "" : "s"
        } were received in the last ${days} days.`,
      });
    }

    const recommendations: Recommendation[] = [];

    if (negativePercentage >= 30) {
      recommendations.push({
        priority: "HIGH",
        title: "Investigate negative feedback",
        action:
          "Review the most recent negative feedback and identify recurring issues that need corrective action.",
      });
    } else if (negativeCount > 0) {
      recommendations.push({
        priority: "MEDIUM",
        title: "Review negative feedback",
        action:
          "Review negative feedback regularly and identify opportunities to improve the customer experience.",
      });
    }

    if (topThemes.length > 0) {
      const topTheme = topThemes[0];

      recommendations.push({
        priority: "MEDIUM",
        title: `Monitor ${topTheme.name}`,
        action: `Review feedback associated with ${topTheme.name} and determine whether a recurring process or product improvement is needed.`,
      });
    }

    if (totalFeedback > 0 && scoredFeedback.length === 0) {
      recommendations.push({
        priority: "LOW",
        title: "Analyze sentiment",
        action:
          "Run sentiment analysis on unscored feedback to improve the quality of insights.",
      });
    }

    return NextResponse.json({
      period: {
        days,
        start: periodStart.toISOString(),
        end: new Date().toISOString(),
      },
      metrics: {
        totalFeedback,
        positiveCount,
        neutralCount,
        negativeCount,
        negativePercentage,
        averageSentimentScore,
      },
      topThemes,
      insights,
      recommendations,
    });
  } catch (error) {
    console.error("Insights API error:", error);

    const details =
      error instanceof Error
        ? error.message
        : "Unknown error";

    return NextResponse.json(
      {
        message: "Failed to generate insights",
        details:
          process.env.NODE_ENV === "development"
            ? details
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}