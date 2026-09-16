import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
const webhookSchema = z.object({
  content: z.string().trim().min(1).max(10000),
  channel: z.string().trim().min(1).max(100),
  customer_label: z.string().trim().max(200).optional(),
  source_ref: z.string().trim().max(200).optional(),
  created_at: z.string().datetime().optional(),
});

export async function POST(request: Request) {
  try {
    const configuredSecret = process.env.WEBHOOK_SECRET;

    if (!configuredSecret) {
      return NextResponse.json(
        {
          message: "Webhook integration is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const providedSecret = request.headers.get("x-webhook-secret");

    if (!providedSecret || providedSecret !== configuredSecret) {
      return NextResponse.json(
        {
          message: "Invalid webhook credentials.",
        },
        {
          status: 401,
        }
      );
    }

    const body: unknown = await request.json();

    const validationResult = webhookSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid webhook payload.",
          errors: validationResult.error.flatten(),
        },
        {
          status: 400,
        }
      );
    }

    const {
      content,
      channel,
      customer_label,
      source_ref,
      created_at,
    } = validationResult.data;

    const workspaceId = process.env.WEBHOOK_WORKSPACE_ID;

    if (!workspaceId) {
      return NextResponse.json(
        {
          message: "Webhook workspace is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const workspace = await db.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      select: {
        id: true,
      },
    });

    if (!workspace) {
      return NextResponse.json(
        {
          message: "Webhook workspace not found.",
        },
        {
          status: 404,
        }
      );
    }

    const feedback = await db.feedback.create({
      data: {
        content,
        channel,
        customerLabel: customer_label || null,
        sourceRef: source_ref || null,
        createdAt: created_at ? new Date(created_at) : new Date(),
        workspaceId: workspace.id,
      },
      select: {
        id: true,
        content: true,
        channel: true,
        customerLabel: true,
        sourceRef: true,
        createdAt: true,
        workspaceId: true,
      },
    });
    await createAuditLog({
        workspaceId: workspace.id,
        userId: null,
        action: "WEBHOOK_FEEDBACK_RECEIVED",
        entityType: "FEEDBACK",
        entityId: feedback.id,
        metadata: {
            channel: feedback.channel,
            sourceRef: feedback.sourceRef,
        },
        });
    return NextResponse.json(
      {
        message: "Feedback received successfully.",
        feedback,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Webhook ingestion error:", error);

    return NextResponse.json(
      {
        message: "Failed to process webhook request.",
      },
      {
        status: 500,
      }
    );
  }
}