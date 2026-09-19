import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { requireRole } from "@/lib/auth";

const createMemberSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email is too long"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),

  role: z.enum(["ANALYST", "VIEWER"]),
});

export async function GET() {
  try {
    const session = await requireRole(["ADMIN"]);

    const members = await db.user.findMany({
      where: {
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      members,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: "Only administrators can manage members" },
          { status: 403 }
        );
      }
    }

    console.error("Get members error:", error);

    return NextResponse.json(
      { error: "Unable to load members" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireRole(["ADMIN"]);

    const body: unknown = await request.json();

    const result = createMemberSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, password, role } = result.data;

    const normalizedEmail = email.toLowerCase();

    const existingUser = await db.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const member = await db.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role,
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await createAuditLog({
      action: "CREATE_MEMBER",
      entityType: "USER",
      entityId: member.id,
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      metadata: {
        name: member.name,
        email: member.email,
        role: member.role,
      },
    });

    return NextResponse.json(
      {
        message: "Member created successfully",
        member,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }

      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: "Only administrators can manage members" },
          { status: 403 }
        );
      }
    }

    console.error("Create member error:", error);

    return NextResponse.json(
      { error: "Unable to create member" },
      { status: 500 }
    );
  }
}