import { NextResponse } from "next/server";
import { z } from "zod";

import { FeedbackStatus } from "@/app/generated/prisma/enums";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";
const routeParamsSchema = z.object({
  id: z.string().min(1, "Feedback ID is required"),
});

const updateFeedbackSchema = z.object({
  status: z.enum(["NEW", "REVIEWED", "ACTIONED"]),
});

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const result = await requireRole([
    "ADMIN",
    "ANALYST",
    "VIEWER",
  ]);

  if ("error" in result) {
    return result.error;
  }

  try {
    const params = await context.params;

    const validatedParams =
      routeParamsSchema.safeParse(params);

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback ID",
        },
        { status: 400 }
      );
    }

    const feedback =
      await db.feedback.findFirst({
        where: {
          id: validatedParams.data.id,
          workspaceId: result.user.workspaceId,
        },
        include: {
          themes: {
            include: {
              theme: true,
            },
          },
          embedding: true,
        },
      });
      
    if (!feedback) {
      return NextResponse.json(
        {
          error: "Feedback not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      feedback,
    });
  } catch (error) {
    console.error(
      "Get feedback detail error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to fetch feedback",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const result = await requireRole([
    "ADMIN",
    "ANALYST",
  ]);

  if ("error" in result) {
    return result.error;
  }

  try {
    const params = await context.params;

    const validatedParams =
      routeParamsSchema.safeParse(params);

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback ID",
        },
        { status: 400 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON request body",
        },
        { status: 400 }
      );
    }

    const validatedBody =
      updateFeedbackSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback status",
          details: validatedBody.error.issues.map(
            (issue) => issue.message
          ),
        },
        { status: 400 }
      );
    }

    const existingFeedback =
      await db.feedback.findFirst({
        where: {
          id: validatedParams.data.id,
          workspaceId: result.user.workspaceId,
        },
        select: {
          id: true,
        },
      });

    if (!existingFeedback) {
      return NextResponse.json(
        {
          error: "Feedback not found",
        },
        { status: 404 }
      );
    }

    const status = validatedBody.data.status;

    const feedback =
      await db.feedback.update({
        where: {
          id: existingFeedback.id,
        },
        data: {
          status,
        },
        include: {
          themes: {
            include: {
              theme: true,
            },
          },
          embedding: true,
        },
      });
    await createAuditLog({
      workspaceId: result.user.workspaceId,
      userId: result.user.id,
      action: "UPDATE",
      entityType: "FEEDBACK",
      entityId: feedback.id,
      metadata: {
        status: feedback.status,
      },
    });
    return NextResponse.json({
      message:
        "Feedback status updated successfully",
      feedback,
    });
  } catch (error) {
    console.error(
      "Update feedback error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to update feedback",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const result = await requireRole([
    "ADMIN",
    "ANALYST",
  ]);

  if ("error" in result) {
    return result.error;
  }

  try {
    const params = await context.params;

    const validatedParams =
      routeParamsSchema.safeParse(params);

    if (!validatedParams.success) {
      return NextResponse.json(
        {
          error: "Invalid feedback ID",
        },
        { status: 400 }
      );
    }

    const existingFeedback =
      await db.feedback.findFirst({
        where: {
          id: validatedParams.data.id,
          workspaceId: result.user.workspaceId,
        },
        select: {
          id: true,
        },
      });

    if (!existingFeedback) {
      return NextResponse.json(
        {
          error: "Feedback not found",
        },
        { status: 404 }
      );
    }

   await db.feedback.delete({
      where: {
        id: existingFeedback.id,
      },
    });

    await createAuditLog({
      workspaceId: result.user.workspaceId,
      userId: result.user.id,
      action: "DELETE",
      entityType: "FEEDBACK",
      entityId: existingFeedback.id,
    });
          
    return NextResponse.json({
      message: "Feedback deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete feedback error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to delete feedback",
      },
      { status: 500 }
    );
  }
}