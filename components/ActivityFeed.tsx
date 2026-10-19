import { Card } from "./ui";
import { UserPlus, BadgeCheck, Wallet } from "lucide-react";

interface ActivityItem {
  id: string;
  kind: "signup" | "approval" | "payout";
  text: string;
  at: string; // ISO timestamp
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const KIND_META = {
  signup: { icon: UserPlus, label: "New clipper joined" },
  approval: { icon: BadgeCheck, label: "Clip approved" },
  payout: { icon: Wallet, label: "Payout sent" },
} as const;

/**
 * Live platform activity — recent signups, clip approvals, and payouts.
 * Real data only: if the tables are empty, renders nothing. Never invents activity.
 */
export default async function ActivityFeed() {
  let items: ActivityItem[] = [];
  try {
    const { createServiceClient } = await import("@/lib/supabase/service");
    const svc = createServiceClient();
    if (!svc) return null;

    const [signups, approvals, payouts] = await Promise.all([
      svc
        .from("profiles")
        .select("id, display_name, created_at")
        .eq("role", "clipper")
        .order("created_at", { ascending: false })
        .limit(4),
      svc
        .from("clips")
        .select("id, account_handle, submitted_at, campaigns(name)")
        .eq("tracking_status", "approved")
        .order("submitted_at", { ascending: false })
        .limit(4),
      svc
        .from("payouts")
        .select("id, final_amount, estimated_amount, created_at")
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(4),
    ]);

    const toItems = (rows: any[] | null, kind: ActivityItem["kind"], text: (r: any) => string, at: (r: any) => string): ActivityItem[] =>
      (rows ?? []).map((r) => ({ id: `${kind}-${r.id}`, kind, text: text(r), at: at(r) }));

    items = [
      ...toItems(
        signups.data,
        "signup",
        (r) => `${r.display_name || "A new clipper"} joined Wondeed`,
        (r) => r.created_at
      ),
      ...toItems(
        approvals.data,
        "approval",
        (r) => {
          const campaign = (r as any).campaigns?.name;
          return campaign
            ? `Clip by @${r.account_handle || "clipper"} approved for ${campaign}`
            : `Clip by @${r.account_handle || "clipper"} approved`;
        },
        (r) => r.submitted_at
      ),
      ...toItems(
        payouts.data,
        "payout",
        (r) => {
          const amt = Number(r.final_amount ?? r.estimated_amount ?? 0);
          return `Payout of $${amt.toFixed(2)} sent to a clipper`;
        },
        (r) => r.created_at
      ),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 10);
  } catch {
    return null;
  }

  if (items.length === 0) return null;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-ink">Live activity</h3>
        <span className="flex items-center gap-1.5 text-xs text-ink-faint">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ink" aria-hidden />
          Happening now
        </span>
      </div>
      <ul className="space-y-3">
        {items.map((item) => {
          const meta = KIND_META[item.kind];
          return (
            <li key={item.id} className="flex items-center gap-3 text-sm">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink/[0.06] text-ink" aria-hidden>
                <meta.icon size={14} />
              </span>
              <span className="min-w-0 flex-1 truncate text-ink-soft">{item.text}</span>
              <span className="shrink-0 text-xs text-ink-faint">{timeAgo(item.at)}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
