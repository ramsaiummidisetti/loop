import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";

export type AppRole = "ADMIN" | "ANALYST" | "VIEWER";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  return session.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

  return {
    user,
  };
}

export async function requireRole(
  allowedRoles: AppRole[]
) {
  const result = await requireAuth();

  if ("error" in result) {
    return result;
  }

  const role = result.user.role as AppRole;

  if (!allowedRoles.includes(role)) {
    return {
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return {
    user: result.user,
  };
}