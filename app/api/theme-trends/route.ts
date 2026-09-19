import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";

type Trend = "UP" | "DOWN" | "STABLE";

type TrendPoint = {
  date: string;
  count: number;
};

type ThemeTrend = {
  themeId: string;
  themeName: string;
  total: number;
  changePercent: number;
  trend: Trend;
  points: TrendPoint[];
};

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getTrend(changePercent: number): Trend {
  if (changePercent > 10) {
    return "UP";
  }

  if (changePercent < -10) {
    return "DOWN";
  }

  return "STABLE";
}

export async function GET() {
  try {
    const session = await requireRole(["ADMIN", "ANALYST", "VIEWER"]);

    const feedbackThemes = await db.feedbackTheme.findMany({
      where: {
        feedback: {
          workspaceId: session.user.workspaceId,
        },
      },
      include: {
        theme: true,
        feedback: {
          select: {
            createdAt: true,
          },
        },
      },
      orderBy: {
        feedback: {
          createdAt: "asc",
        },
      },
    });

    const grouped = new Map<
      string,
      {
        themeName: string;
        dates: Map<string, number>;
      }
    >();

    for (const item of feedbackThemes) {
      const existing = grouped.get(item.themeId);

      if (existing) {
        const date = formatDate(item.feedback.createdAt);
        existing.dates.set(date, (existing.dates.get(date) ?? 0) + 1);
      } else {
        const dates = new Map<string, number>();
        const date = formatDate(item.feedback.createdAt);
        dates.set(date, 1);

        grouped.set(item.themeId, {
          themeName: item.theme.name,
          dates,
        });
      }
    }

    const trends: ThemeTrend[] = [];

    for (const [themeId, theme] of grouped.entries()) {
      const dates = Array.from(theme.dates.keys()).sort();

      if (dates.length === 0) {
        continue;
      }

      const startDate = new Date(`${dates[0]}T00:00:00.000Z`);
      const endDate = new Date(`${dates[dates.length - 1]}T00:00:00.000Z`);

      const points: TrendPoint[] = [];

      const cursor = new Date(startDate);

      while (cursor <= endDate) {
        const date = formatDate(cursor);

        points.push({
          date,
          count: theme.dates.get(date) ?? 0,
        });

        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }

      const total = points.reduce((sum, point) => sum + point.count, 0);

      const midpoint = Math.max(1, Math.floor(points.length / 2));

      const previousPeriod = points
        .slice(0, midpoint)
        .reduce((sum, point) => sum + point.count, 0);

      const currentPeriod = points
        .slice(midpoint)
        .reduce((sum, point) => sum + point.count, 0);

      const changePercent =
        previousPeriod === 0
          ? currentPeriod > 0
            ? 100
            : 0
          : Math.round(
              ((currentPeriod - previousPeriod) / previousPeriod) * 100,
            );

      trends.push({
        themeId,
        themeName: theme.themeName,
        total,
        changePercent,
        trend: getTrend(changePercent),
        points,
      });
    }

    trends.sort((a, b) => b.total - a.total);

    const spikes = trends.filter(
      (theme) => theme.changePercent >= 50 && theme.total >= 2,
    );

    return NextResponse.json({
      trends,
      spikes,
    });
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

    console.error("Theme trends error:", error);

    return NextResponse.json(
      { message: "Unable to load theme trends." },
      { status: 500 },
    );
  }
}