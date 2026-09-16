import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireAuth } from "@/lib/permissions";

export async function GET() {
  const result = await requireAuth();

  if ("error" in result) {
    return result.error;
  }

  const workspace = await db.workspace.findUnique({
    where: {
      id: result.user.workspaceId,
    },
  });

  if (!workspace) {
    return NextResponse.json(
      {
        error: "Workspace not found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({
    workspace: {
      id: workspace.id,
      name: workspace.name,
      createdAt: workspace.createdAt,
    },
  });
}