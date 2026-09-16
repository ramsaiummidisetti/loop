import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  workspaceName: z
    .string()
    .min(1, "Workspace name is required")
    .max(100),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = signupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid input",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { name, email, password, workspaceName } = result.data;

    const existingUser = await db.user.findUnique({
      where: {
        email,
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

    const resultTransaction = await db.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: workspaceName,
        },
      });

      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "ADMIN",
          workspaceId: workspace.id,
        },
      });

      return {
        workspace,
        user,
      };
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: resultTransaction.user.id,
          name: resultTransaction.user.name,
          email: resultTransaction.user.email,
          role: resultTransaction.user.role,
        },
        workspace: {
          id: resultTransaction.workspace.id,
          name: resultTransaction.workspace.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);

    return NextResponse.json(
      {
        error: "Unable to create account",
      },
      { status: 500 }
    );
  }
}