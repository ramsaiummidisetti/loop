import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { createAuditLog } from "@/lib/audit";

const routeParamsSchema = z.object({
  id: z.string().min(1, "Feedback ID is required"),
});

const extractedThemeSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  color: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

type ExtractedTheme = z.infer<
  typeof extractedThemeSchema
>;

function generateMockThemes(
  content: string
): ExtractedTheme[] {
  const text = content.toLowerCase();

  const themes: ExtractedTheme[] = [];

  if (
    text.includes("support") ||
    text.includes("response") ||
    text.includes("help") ||
    text.includes("customer service")
  ) {
    themes.push({
      name: "Customer Support",
      description:
        "Feedback related to customer support and service response.",
      color: "#3B82F6",
      confidence: 0.9,
    });
  }

  if (
    text.includes("delivery") ||
    text.includes("shipping") ||
    text.includes("late") ||
    text.includes("arrive")
  ) {
    themes.push({
      name: "Delivery",
      description:
        "Feedback related to delivery, shipping, and order arrival.",
      color: "#F59E0B",
      confidence: 0.9,
    });
  }

  if (
    text.includes("product") ||
    text.includes("quality") ||
    text.includes("broken") ||
    text.includes("damaged")
  ) {
    themes.push({
      name: "Product Quality",
      description:
        "Feedback related to product quality and condition.",
      color: "#10B981",
      confidence: 0.88,
    });
  }

  if (
    text.includes("price") ||
    text.includes("pricing") ||
    text.includes("cost") ||
    text.includes("expensive") ||
    text.includes("cheap")
  ) {
    themes.push({
      name: "Pricing",
      description:
        "Feedback related to product pricing and cost.",
      color: "#8B5CF6",
      confidence: 0.86,
    });
  }

  if (
    text.includes("checkout") ||
    text.includes("purchase") ||
    text.includes("order") ||
    text.includes("buy")
  ) {
    themes.push({
      name: "Purchase Experience",
      description:
        "Feedback related to purchasing and checkout experience.",
      color: "#EC4899",
      confidence: 0.9,
    });
  }

  if (
    text.includes("website") ||
    text.includes("app") ||
    text.includes("page") ||
    text.includes("interface") ||
    text.includes("easy")
  ) {
    themes.push({
      name: "User Experience",
      description:
        "Feedback related to usability and overall user experience.",
      color: "#06B6D4",
      confidence: 0.85,
    });
  }

  if (themes.length === 0) {
    themes.push({
      name: "General Feedback",
      description:
        "General customer feedback that does not match a specific theme.",
      color: "#6B7280",
      confidence: 0.5,
    });
  }

  return themes.slice(0, 3);
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
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

    const feedback =
      await db.feedback.findFirst({
        where: {
          id: validatedParams.data.id,
          workspaceId: result.user.workspaceId,
        },
        select: {
          id: true,
          content: true,
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

    const extractedThemes =
      generateMockThemes(feedback.content);

    const validatedThemes =
      z
        .array(extractedThemeSchema)
        .safeParse(extractedThemes);

    if (!validatedThemes.success) {
      return NextResponse.json(
        {
          error: "Invalid theme extraction result",
        },
        { status: 500 }
      );
    }

    /*
     * Remove previously extracted themes for this
     * feedback before saving the new results.
     */
    await db.feedbackTheme.deleteMany({
      where: {
        feedbackId: feedback.id,
      },
    });

    const savedThemes = [];

    for (const theme of validatedThemes.data) {
      let existingTheme =
        await db.theme.findFirst({
          where: {
            workspaceId: result.user.workspaceId,
            name: theme.name,
          },
        });

      if (!existingTheme) {
        existingTheme =
          await db.theme.create({
            data: {
              name: theme.name,
              description: theme.description,
              color: theme.color,
              workspaceId:
                result.user.workspaceId,
            },
          });
      }

      const feedbackTheme =
        await db.feedbackTheme.create({
          data: {
            feedbackId: feedback.id,
            themeId: existingTheme.id,
            confidence: theme.confidence,
          },
          include: {
            theme: true,
          },
        });

      savedThemes.push(feedbackTheme);
    }
        await createAuditLog({
      workspaceId: result.user.workspaceId,
      userId: result.user.id,
      action: "EXTRACT_THEMES",
      entityType: "FEEDBACK",
      entityId: feedback.id,
      metadata: {
        themeCount: validatedThemes.data.length,
      },
    });
    return NextResponse.json({
      message:
        "Themes extracted successfully",
      themes: savedThemes.map((item) => ({
        id: item.theme.id,
        name: item.theme.name,
        description:
          item.theme.description,
        color: item.theme.color,
        confidence: item.confidence,
      })),
    });
  } catch (error) {
    console.error(
      "Theme extraction error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to extract feedback themes",
      },
      { status: 500 }
    );
  }
}