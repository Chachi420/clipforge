// Data-access layer. Uses Supabase when configured, otherwise the demo
// dataset in lib/mock.ts. Every function returns the same shape either way,
// so pages never care which backend is active.
import * as mock from "./mock";
import type {
  AuthProvider, Bounty, Campaign, Clip, ClipperProfile, PaymentMethodRow,
  PayoutCycle, SocialAccount, Team,
} from "./types";

const useSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function isLive() {
  return useSupabase;
}

function toCampaign(row: any, joinedIds?: Set<string>): Campaign {
  return {
    id: row.id, slug: row.slug, name: row.name, iconUrl: row.icon_url ?? "",
    status: row.status, type: row.type, category: row.category,
    platforms: row.platforms, payoutMethod: row.payout_method,
    ratePer100k: Number(row.rate_per_100k),
    platformRates: row.platform_rates ?? undefined,
    minViewsPerPost: row.min_views_per_post, minViewsTotal: row.min_views_total,
    daysLeft: row.days_left, startDate: row.start_date,
    budgetCap: row.budget_cap ?? undefined, durationMode: row.duration_mode,
    payoutMode: row.payout_mode, potValue: row.pot_value ?? undefined,
    bountyPot: row.bounty_pot ?? undefined, accountLimit: row.account_limit ?? undefined,
    rules: row.rules, isJoined: joinedIds ? joinedIds.has(row.id) : (row.is_joined ?? false),
  };
}

function toBounty(row: any): Bounty {
  return {
    id: row.id, campaignId: row.campaign_id, name: row.name,
    ratePer100k: Number(row.rate_per_100k), requirements: row.requirements,
    isActive: row.is_active, clipCount: row.clip_count ?? 0,
    totalViews: row.total_views ?? 0, budgetCap: row.budget_cap ?? undefined,
    budgetUsedPct: Number(row.budget_used_pct ?? 0),
  };
}

function latestMetrics(row: any) {
  const s = Array.isArray(row.clip_metric_snapshots)
    ? row.clip_metric_snapshots[0]
    : row.clip_metric_snapshots;
  return { views: s?.views ?? 0, likes: s?.likes ?? 0, comments: s?.comments ?? 0 };
}

function toClip(row: any): Clip {
  const { views, likes, comments } = "clip_metric_snapshots" in row
    ? latestMetrics(row)
    : { views: row.views ?? 0, likes: row.likes ?? 0, comments: row.comments ?? 0 };
  return {
    id: row.id, campaignId: row.campaign_id, bountyId: row.bounty_id,
    platform: row.platform, postUrl: row.post_url, accountHandle: row.account_handle,
    streamerName: row.streamer_name, trackingStatus: row.tracking_status,
    views, likes, comments,
    engagementPct: views ? Math.round(((likes + comments) / views) * 1000) / 10 : 0,
    payout: Number(row.payout ?? 0), submittedAt: row.submitted_at,
  };
}

function toProfile(row: any): ClipperProfile {
  return {
    id: row.id,
    provider: (row.provider ?? "google") as AuthProvider,
    email: row.email ?? "",
    displayName: row.display_name ?? "Clipper",
    bio: row.bio ?? null,
    avatarUrl: row.avatar_url ?? "",
    status: row.status ?? "active",
    joinedAt: (row.joined_at ?? "").slice(0, 10),
    publicProfile: !!row.public_profile,
    clipsSubmitted: 0, avgClipsPerDay: 0, activeDays: 0,
  };
}

async function sb() {
  const { createClient } = await import("./supabase/server");
  return createClient();
}

// ---------- campaigns ----------

export async function getCampaigns(userId?: string): Promise<Campaign[]> {
  if (!useSupabase) return mock.campaigns;
  const supabase = await sb();
  const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  let joined: Set<string> | undefined;
  if (userId) {
    const { data: m } = await supabase.from("campaign_members").select("campaign_id").eq("user_id", userId);
    joined = new Set((m ?? []).map((r: any) => r.campaign_id));
  }
  return (data ?? []).map((r) => toCampaign(r, joined));
}

export async function getCampaign(slug: string, userId?: string): Promise<Campaign | null> {
  if (!useSupabase) return mock.campaigns.find((c) => c.slug === slug) ?? null;
  const supabase = await sb();
  const { data } = await supabase.from("campaigns").select("*").eq("slug", slug).single();
  if (!data) return null;
  let joined: Set<string> | undefined;
  if (userId) {
    const { data: m } = await supabase.from("campaign_members").select("campaign_id").eq("user_id", userId);
    joined = new Set((m ?? []).map((r: any) => r.campaign_id));
  }
  return toCampaign(data, joined);
}

export async function getBounties(campaignId: string): Promise<Bounty[]> {
  if (!useSupabase) return mock.bounties.filter((b) => b.campaignId === campaignId);
  const supabase = await sb();
  const { data } = await supabase.from("bounties").select("*").eq("campaign_id", campaignId);
  return (data ?? []).map(toBounty);
}

// ---------- profile ----------

export async function getProfile(userId: string): Promise<ClipperProfile | null> {
  if (!useSupabase) return mock.profile;
  const supabase = await sb();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (!data) return null;
  const profile = toProfile(data);
  const { count } = await supabase.from("clips").select("id", { count: "exact", head: true }).eq("user_id", userId);
  profile.clipsSubmitted = count ?? 0;
  return profile;
}

// ---------- clips ----------

const CLIP_SELECT = `
  id, campaign_id, bounty_id, platform, post_url, account_handle,
  streamer_name, tracking_status, submitted_at,
  clip_metric_snapshots (views, likes, comments)
`;

export async function getUserClips(userId: string, campaignId?: string): Promise<Clip[]> {
  if (!useSupabase)
    return campaignId ? mock.clips.filter((c) => c.campaignId === campaignId) : mock.clips;
  const supabase = await sb();
  let q = supabase.from("clips").select(CLIP_SELECT).eq("user_id", userId)
    .order("submitted_at", { ascending: false });
  if (campaignId) q = q.eq("campaign_id", campaignId);
  const { data } = await q;
  return (data ?? []).map(toClip);
}

// ---------- payouts ----------

export async function getUserPayouts(userId: string): Promise<PayoutCycle[]> {
  if (!useSupabase) return mock.payoutCycles;
  const supabase = await sb();
  const { data } = await supabase
    .from("payouts")
    .select("estimated_amount, status, payout_cycles!inner(id, cycle_number, period_start, period_end, snapshot_at, status, campaigns!inner(id, name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return (data ?? []).map((r: any) => {
    const c = r.payout_cycles;
    return {
      id: `${c.id}:${userId}`,
      campaignId: c.campaigns.id,
      campaignName: c.campaigns.name,
      cycleNumber: c.cycle_number,
      periodStart: c.period_start,
      periodEnd: c.period_end,
      snapshotAt: c.snapshot_at,
      status: r.status === "paid" ? "paid" : c.status === "live" ? "live" : "awaiting_mark_paid",
      estimatedAmount: Number(r.estimated_amount ?? 0),
      totalViews: 0,
      totalClips: 0,
    } as PayoutCycle;
  });
}

export async function getUserPaymentMethods(userId: string): Promise<PaymentMethodRow[]> {
  if (!useSupabase) return mock.paymentMethods;
  const supabase = await sb();
  const { data } = await supabase.from("payment_methods").select("*").eq("user_id", userId).order("created_at");
  return (data ?? []).map((r: any) => ({
    id: r.id, type: r.type, label: r.type,
    masked: maskIdentifier(r.identifier), isDefault: r.is_default,
  }));
}

function maskIdentifier(id: string): string {
  if (!id) return "";
  if (id.includes("@")) {
    const [u, d] = id.split("@");
    return `${u.slice(0, 2)}***@${d}`;
  }
  return `${id.slice(0, 6)}…${id.slice(-4)}`;
}

// ---------- social accounts ----------

export async function getUserSocialAccounts(userId: string): Promise<SocialAccount[]> {
  if (!useSupabase) return mock.socialAccounts;
  const supabase = await sb();
  const { data } = await supabase.from("social_accounts").select("*").eq("user_id", userId).order("connected_at");
  return (data ?? []).map((r: any) => ({
    id: r.id, platform: r.platform, handle: r.handle, verified: r.verified,
  }));
}

// ---------- teams ----------

export async function getUserTeams(userId: string): Promise<Team[]> {
  if (!useSupabase) return mock.teams;
  const supabase = await sb();
  const { data } = await supabase.from("teams").select("id, name, referral_code").eq("owner_id", userId);
  return (data ?? []).map((r: any) => ({
    id: r.id, name: r.name, referralCode: r.referral_code, members: 0, commissionEarned: 0,
  }));
}
