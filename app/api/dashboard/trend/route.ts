import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

export async function GET() {
  const result = await requireRole(["ADMIN", "ANALYST", "VIEWER"]);

  if ("error" in result) {
    return result.error;
  }

  try {
    const feedback = await db.feedback.findMany({
      where: {
        workspaceId: result.user.workspaceId,
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const trendMap = new Map<string, number>();

    for (const item of feedback) {
      const date = item.createdAt.toISOString().slice(0, 10);

      trendMap.set(date, (trendMap.get(date) ?? 0) + 1);
    }

    const trend = Array.from(trendMap.entries()).map(
      ([date, count]) => ({
        date,
        count,
      })
    );

    return NextResponse.json({
      trend,
    });
  } catch (error) {
    console.error("Dashboard trend error:", error);

    return NextResponse.json(
      {
        error: "Unable to load feedback trend",
      },
      { status: 500 }
    );
  }
}