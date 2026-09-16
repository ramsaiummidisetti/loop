import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import {
  cosineSimilarity,
  generateLocalEmbedding,
} from "@/lib/embedding";

const searchSchema = z.object({
  query: z.string().trim().min(1, "Search query is required").max(500),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function GET(request: Request) {
  try {
    const session = await requireRole([
      "ADMIN",
      "ANALYST",
      "VIEWER",
    ]);

    const url = new URL(request.url);

    const validationResult = searchSchema.safeParse({
      query: url.searchParams.get("query"),
      limit: url.searchParams.get("limit") ?? "10",
    });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid search parameters",
          errors: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { query, limit } = validationResult.data;

    const queryVector = generateLocalEmbedding(query);

    const feedback = await db.feedback.findMany({
      where: {
        workspaceId: session.user.workspaceId,
        embedding: {
          isNot: null,
        },
      },
      select: {
        id: true,
        content: true,
        channel: true,
        customerLabel: true,
        sentiment: true,
        sentimentScore: true,
        status: true,
        createdAt: true,
        embedding: {
          select: {
            vector: true,
          },
        },
      },
    });

    const results = feedback
      .map((item) => {
        const similarity = cosineSimilarity(
          queryVector,
          item.embedding?.vector ?? []
        );

        return {
          id: item.id,
          content: item.content,
          channel: item.channel,
          customerLabel: item.customerLabel,
          sentiment: item.sentiment,
          sentimentScore: item.sentimentScore,
          status: item.status,
          createdAt: item.createdAt,
          similarity,
        };
      })
      .sort(
        (first, second) =>
          second.similarity - first.similarity
      )
      .slice(0, limit);

    return NextResponse.json({
      query,
      results,
    });
  } catch (error) {
    console.error("Semantic search error:", error);

    const details =
      error instanceof Error
        ? error.message
        : "Unknown error";

    return NextResponse.json(
      {
        message: "Failed to perform semantic search",
        details:
          process.env.NODE_ENV === "development"
            ? details
            : undefined,
      },
      { status: 500 }
    );
  }
}