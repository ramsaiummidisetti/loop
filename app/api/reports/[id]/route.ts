import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

const paramsSchema = z.object({
  id: z.string().min(1),
});

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole([
      "ADMIN",
      "ANALYST",
      "VIEWER",
    ]);

    const params = await context.params;
    const parsedParams = paramsSchema.safeParse(params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { message: "Invalid report ID." },
        { status: 400 }
      );
    }

    const report = await db.report.findFirst({
      where: {
        id: parsedParams.data.id,
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        title: true,
        periodStart: true,
        periodEnd: true,
        contentJson: true,
        createdAt: true,
        generatedBy: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    console.error("GET /api/reports/[id] error:", error);

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Forbidden." },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { message: "Failed to load report." },
      { status: 500 }
    );
  }
}
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN"]);

    const params = await context.params;
    const parsedParams = paramsSchema.safeParse(params);

    if (!parsedParams.success) {
      return NextResponse.json(
        { message: "Invalid report ID." },
        { status: 400 }
      );
    }

    const report = await db.report.findFirst({
      where: {
        id: parsedParams.data.id,
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (!report) {
      return NextResponse.json(
        { message: "Report not found." },
        { status: 404 }
      );
    }

    await db.report.delete({
      where: {
        id: report.id,
      },
    });

    await createAuditLog({
      action: "DELETE_REPORT",
      entityType: "REPORT",
      entityId: report.id,
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      metadata: {
        title: report.title,
      },
    });

    return NextResponse.json({
      message: "Report deleted successfully.",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { message: "Only admins can delete reports." },
        { status: 403 }
      );
    }

    console.error("Report deletion error:", error);

    return NextResponse.json(
      { message: "Unable to delete report." },
      { status: 500 }
    );
  }
}