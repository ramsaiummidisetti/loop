import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

export async function GET() {
  const result = await requireRole(["ADMIN", "ANALYST", "VIEWER"]);

  if ("error" in result) {
    return result.error;
  }

  try {
    const workspaceId = result.user.workspaceId;

    const [
      total,
      newCount,
      reviewed,
      actioned,
      positive,
      neutral,
      negative,
    ] = await Promise.all([
      db.feedback.count({
        where: { workspaceId },
      }),

      db.feedback.count({
        where: {
          workspaceId,
          status: "NEW",
        },
      }),

      db.feedback.count({
        where: {
          workspaceId,
          status: "REVIEWED",
        },
      }),

      db.feedback.count({
        where: {
          workspaceId,
          status: "ACTIONED",
        },
      }),

      db.feedback.count({
        where: {
          workspaceId,
          sentiment: "POS",
        },
      }),

      db.feedback.count({
        where: {
          workspaceId,
          sentiment: "NEU",
        },
      }),

      db.feedback.count({
        where: {
          workspaceId,
          sentiment: "NEG",
        },
      }),
    ]);

    return NextResponse.json({
      metrics: {
        total,
        status: {
          new: newCount,
          reviewed,
          actioned,
        },
        sentiment: {
          positive,
          neutral,
          negative,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);

    return NextResponse.json(
      {
        error: "Unable to load dashboard metrics",
      },
      { status: 500 }
    );
  }
}