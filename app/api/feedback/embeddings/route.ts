import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { generateLocalEmbedding } from "@/lib/embedding";
import { createAuditLog } from "@/lib/audit";

const requestSchema = z.object({
  limit: z.coerce.number().int().min(1).max(500).default(100),
});

export async function POST(request: Request) {
  try {
    const session = await requireRole(["ADMIN", "ANALYST"]);

    const body: unknown = await request.json();

    const validationResult = requestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid request body",
          errors: validationResult.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const { limit } = validationResult.data;

    const feedbackItems = await db.feedback.findMany({
      where: {
        workspaceId: session.user.workspaceId,
        embedding: {
          is: null,
        },
      },
      select: {
        id: true,
        content: true,
      },
      orderBy: {
        createdAt: "asc",
      },
      take: limit,
    });

    let generated = 0;
    let failed = 0;

    for (const feedback of feedbackItems) {
      try {
        const vector = generateLocalEmbedding(feedback.content);

        if (
          vector.length === 0 ||
          vector.some((value) => !Number.isFinite(value))
        ) {
          failed += 1;
          continue;
        }

           await db.embedding.upsert({
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

        generated += 1;
      } catch (error) {
        console.error(
          `Failed to generate embedding for ${feedback.id}:`,
          error
        );

        failed += 1;
      }
    }

    const remaining = await db.feedback.count({
      where: {
        workspaceId: session.user.workspaceId,
        embedding: {
          is: null,
        },
      },
    });

    return NextResponse.json({
      message: "Bulk embedding generation completed",
      generated,
      failed,
      remaining,
    });
    } catch (error) {
    console.error("Bulk embedding generation error:", error);

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
        message: "Failed to generate embeddings",
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