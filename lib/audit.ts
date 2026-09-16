import { db } from "@/lib/db";

type AuditLogInput = {
  workspaceId: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export async function createAuditLog({
  workspaceId,
  userId,
  action,
  entityType,
  entityId,
  metadata,
}: AuditLogInput): Promise<void> {
  await db.auditLog.create({
    data: {
      workspaceId,
      userId,
      action,
      entityType,
      entityId: entityId ?? null,
      metadata: metadata ?? undefined,
    },
  });
}