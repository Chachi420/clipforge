"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { isLive } from "@/lib/db";

/** Unread notification count for the header bell badge. */
export async function getUnreadNotificationCount(): Promise<number> {
  if (!isLive()) return 0;
  const user = await getSessionUser();
  if (!user) return 0;
  const supabase = createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  return count ?? 0;
}

/** Mark all of the user's notifications as read. */
export async function markAllNotificationsRead(): Promise<void> {
  if (!isLive()) return;
  const user = await getSessionUser();
  if (!user) return;
  const supabase = createClient();
  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user.id)
    .eq("is_read", false);
  revalidatePath("/dashboard/notifications");
}
