import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { generateLocalEmbedding } from "@/lib/embedding";
import { createAuditLog } from "@/lib/audit";

const routeParamsSchema = z.object({
  id: z.string().min(1),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);

    const rawParams = await context.params;
    const paramsResult = routeParamsSchema.safeParse(rawParams);

    if (!paramsResult.success) {
      return NextResponse.json(
        {
          message: "Invalid feedback ID",
        },
        {
          status: 400,
        }
      );
    }

    const feedback = await db.feedback.findFirst({
      where: {
        id: paramsResult.data.id,
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        content: true,
      },
    });

    if (!feedback) {
      return NextResponse.json(
        {
          message: "Feedback not found",
        },
        {
          status: 404,
        }
      );
    }

    const vector = generateLocalEmbedding(feedback.content);

    if (
      vector.length === 0 ||
      vector.some((value) => !Number.isFinite(value))
    ) {
      return NextResponse.json(
        {
          message: "Failed to generate a valid embedding vector",
        },
        {
          status: 500,
        }
      );
    }
    const embedding = await db.embedding.upsert({
      where: {
        feedbackId: feedback.id,
      },
      create: {
        feedbackId: feedback.id,
        vector,
      },
      update: {
        vector,
      },
      select: {
        id: true,
        feedbackId: true,
        vector: true,
      },
    });
      await createAuditLog({
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      action: "EMBEDDING_GENERATED",
      entityType: "FEEDBACK",
      entityId: feedback.id,
      metadata: {
        dimensions: vector.length,
      },
    });
    return NextResponse.json(
      {
        message: "Embedding generated successfully",
        embedding: {
          id: embedding.id,
          feedbackId: embedding.feedbackId,
          dimensions: embedding.vector.length,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
  console.error("Embedding generation error:", error);

  const details =
    error instanceof Error
      ? error.message
      : "Unknown error";

  if (details === "FORBIDDEN") {
    return NextResponse.json(
      {
        message: "Forbidden",
      },
      {
        status: 403,
      }
    );
  }

  return NextResponse.json(
    {
      message: "Failed to generate embedding",
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