/**
 * Internal admin helpers — NOT server actions.
 * Import only from server-side code (admin actions with requireAdmin,
 * or the HMAC-signed email-action route). Never import from client components.
 */
import { adminDb } from "./admin-db";

export async function insertNotificationInternal(
  userId: string,
  type: string,
  title: string,
  body: string
) {
  const db = adminDb();
  await db.from("notifications").insert({ user_id: userId, type, title, body });
}

export async function logAdminActionInternal(input: {
  actor: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  const db = adminDb();
  await db.from("admin_audit_log").insert({
    actor: input.actor,
    action: input.action,
    target_type: input.targetType,
    target_id: input.targetId,
    summary: input.summary,
    metadata: input.metadata ?? {},
  });
}
