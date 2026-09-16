import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { FeedbackStatus, Sentiment } from "@/app/generated/prisma/enums";
import { createAuditLog } from "@/lib/audit";

const feedbackSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Feedback content is required")
    .max(10000, "Feedback is too long"),

  channel: z
    .string()
    .trim()
    .min(1, "Source is required")
    .max(100),

  sourceRef: z
    .string()
    .trim()
    .max(500)
    .optional()
    .or(z.literal("")),

  customerLabel: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal("")),
});

export async function POST(request: Request) {
  const result = await requireRole(["ADMIN", "ANALYST"]);

  if ("error" in result) {
    return result.error;
  }

  try {
    const body = await request.json();

    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback data",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const feedback = await db.feedback.create({
      data: {
        content: parsed.data.content,
        channel: parsed.data.channel,
        sourceRef: parsed.data.sourceRef || null,
        customerLabel: parsed.data.customerLabel || null,
        workspaceId: result.user.workspaceId,
      },
    });
    
    await createAuditLog({
      workspaceId: result.user.workspaceId,
      userId: result.user.id,
      action: "CREATE",
      entityType: "FEEDBACK",
      entityId: feedback.id,
      metadata: {
        channel: feedback.channel,
      },
    });

    return NextResponse.json(
      {
        message: "Feedback created successfully",
        feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create feedback error:", error);

    return NextResponse.json(
      {
        error: "Unable to create feedback",
      },
      { status: 500 }
    );
  }
}
export async function GET(request: Request) {
  const result = await requireRole(["ADMIN", "ANALYST", "VIEWER"]);

  if ("error" in result) {
    return result.error;
  }

  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const channel = searchParams.get("channel")?.trim() || "";
    const statusParam = searchParams.get("status")?.trim() || "";
    const sentimentParam =
      searchParams.get("sentiment")?.trim() || "";

    const page = Math.max(
      Number(searchParams.get("page")) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(searchParams.get("limit")) || 10, 1),
      50
    );

    const skip = (page - 1) * limit;

    const status = Object.values(FeedbackStatus).includes(
      statusParam as FeedbackStatus
    )
      ? (statusParam as FeedbackStatus)
      : undefined;

    const sentiment = Object.values(Sentiment).includes(
      sentimentParam as Sentiment
    )
      ? (sentimentParam as Sentiment)
      : undefined;

    const where = {
      workspaceId: result.user.workspaceId,

      ...(channel
        ? {
            channel,
          }
        : {}),

      ...(status
        ? {
            status,
          }
        : {}),

      ...(sentiment
        ? {
            sentiment,
          }
        : {}),

      ...(search
        ? {
            OR: [
              {
                content: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                customerLabel: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                sourceRef: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };

    const [feedback, total] = await Promise.all([
      db.feedback.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      db.feedback.count({
        where,
      }),
    ]);

    return NextResponse.json({
      feedback,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get feedback error:", error);

    return NextResponse.json(
      {
        error: "Unable to fetch feedback",
      },
      { status: 500 }
    );
  }
}