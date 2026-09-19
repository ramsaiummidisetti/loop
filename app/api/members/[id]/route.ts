import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/audit";
import { requireRole } from "@/lib/auth";

const updateRoleSchema = z.object({
  role: z.enum(["ANALYST", "VIEWER"]),
});

const idSchema = z.string().min(1);

type RouteContext = {
  params: {
    id: string;
  };
};

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await requireRole(["ADMIN"]);

    const { id } = context.params;

    const idResult = idSchema.safeParse(id);

    if (!idResult.success) {
      return NextResponse.json(
        { error: "Invalid member ID" },
        { status: 400 }
      );
    }

    // Prevent the Admin from changing their own role.
    if (id === session.user.id) {
      return NextResponse.json(
        {
          error: "You cannot change your own administrator role.",
        },
        { status: 400 }
      );
    }

    const body: unknown = await request.json();

    const result = updateRoleSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid role",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { role } = result.data;

    // Find the member only inside the Admin's workspace.
    const member = await db.user.findFirst({
      where: {
        id,
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        {
          error: "Member not found in your workspace.",
        },
        { status: 404 }
      );
    }

    if (member.role === "ADMIN") {
      return NextResponse.json(
        {
          error: "Administrator roles cannot be changed here.",
        },
        { status: 400 }
      );
    }

    const updatedMember = await db.user.update({
      where: {
        id: member.id,
      },
      data: {
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await createAuditLog({
      action: "UPDATE_MEMBER_ROLE",
      entityType: "USER",
      entityId: updatedMember.id,
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      metadata: {
        previousRole: member.role,
        newRole: updatedMember.role,
        memberName: updatedMember.name,
        memberEmail: updatedMember.email,
      },
    });

    return NextResponse.json({
      message: "Member role updated successfully",
      member: updatedMember,
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
          {
            error: "Only administrators can manage member roles",
          },
          { status: 403 }
        );
      }
    }

    console.error("Update member role error:", error);

    return NextResponse.json(
      {
        error: "Unable to update member role",
      },
      { status: 500 }
    );
  }
}
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  try {
    const session = await requireRole(["ADMIN"]);

    const { id } = context.params;

    const idResult = idSchema.safeParse(id);

    if (!idResult.success) {
      return NextResponse.json(
        { error: "Invalid member ID" },
        { status: 400 }
      );
    }

    // Admin cannot remove their own account.
    if (id === session.user.id) {
      return NextResponse.json(
        {
          error: "You cannot remove your own administrator account.",
        },
        { status: 400 }
      );
    }

    // Find the member only inside the Admin's workspace.
    const member = await db.user.findFirst({
      where: {
        id,
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        {
          error: "Member not found in your workspace.",
        },
        { status: 404 }
      );
    }

    // Protect administrator accounts.
    if (member.role === "ADMIN") {
      return NextResponse.json(
        {
          error: "Administrator accounts cannot be removed here.",
        },
        { status: 400 }
      );
    }

    await db.user.delete({
      where: {
        id: member.id,
      },
    });

    await createAuditLog({
      action: "REMOVE_MEMBER",
      entityType: "USER",
      entityId: member.id,
      workspaceId: session.user.workspaceId,
      userId: session.user.id,
      metadata: {
        removedMemberName: member.name,
        removedMemberEmail: member.email,
        removedMemberRole: member.role,
      },
    });

    return NextResponse.json({
      message: "Member removed successfully",
      memberId: member.id,
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
          {
            error: "Only administrators can remove members",
          },
          { status: 403 }
        );
      }
    }

    console.error("Remove member error:", error);

    return NextResponse.json(
      {
        error: "Unable to remove member",
      },
      { status: 500 }
    );
  }
}