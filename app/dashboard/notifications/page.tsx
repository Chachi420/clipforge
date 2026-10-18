import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Header from "@/components/Header";
import { Badge, Button, Card, EmptyState } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser } from "@/lib/auth";
import { isLive } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Unread notification count for the header bell badge. */
export async function getUnreadNotificationCount(): Promise<number> {
  "use server";
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
  "use server";
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

interface NotificationRow {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export default async function NotificationsPage() {
  if (!isLive()) redirect("/dashboard");
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const supabase = createClient();
  const { data } = await supabase
    .from("notifications")
    .select("id, type, title, body, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  const notifications = (data ?? []) as NotificationRow[];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Header
        title="Notifications"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread`
            : "You're all caught up"
        }
        action={
          unreadCount > 0 ? (
            <form action={markAllNotificationsRead}>
              <Button type="submit" variant="ghost">
                Mark all read
              </Button>
            </form>
          ) : undefined
        }
      />
      <div className="mt-6 space-y-3">
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications yet"
            body="Clip approvals, payouts, and campaign updates will show up here."
          />
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              className={`p-4 sm:p-5 ${n.is_read ? "opacity-70" : ""}`}
            >
              <div className="flex items-start gap-3">
                {!n.is_read && (
                  <span
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ink"
                    aria-label="Unread"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{n.title}</h3>
                    {!n.is_read && <Badge>New</Badge>}
                  </div>
                  {n.body && (
                    <p className="mt-1 text-sm text-ink-soft">{n.body}</p>
                  )}
                  <p className="mt-1.5 text-xs text-ink-faint">
                    {timeAgo(n.created_at)}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
