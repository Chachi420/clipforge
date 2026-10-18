// Data-access layer. Uses Supabase when configured, otherwise the demo
// dataset in lib/mock.ts. Every function returns the same shape either way,
// so pages never care which backend is active.
import * as mock from "./mock";
import type {
  AuthProvider, Bounty, Campaign, Clip, ClipperProfile, EligibilityType, PaymentMethodRow,
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
    brandId: row.brand_id ?? undefined,
    eligibilityType: (row.eligibility_type as EligibilityType) ?? "open",
    minFollowers: row.min_followers ?? undefined,
    minAvgViews: row.min_avg_views ?? undefined,
    promoFormats: row.promo_formats ?? ["video"],
    aspectRatios: row.aspect_ratios ?? ["9:16"],
    minDurationSec: row.min_duration_sec ?? null,
    maxDurationSec: row.max_duration_sec ?? null,
    requiredHashtags: row.required_hashtags ?? [],
    requiredTags: row.required_tags ?? [],
    sourceMaterialUrl: row.source_material_url ?? null,
    minClipsExpected: row.min_clips_expected ?? 1,
    requiresPreapproval: row.requires_preapproval ?? false,
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
    role: row.role ?? "clipper",
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
  // Pending (unapproved) briefs must not appear in the public explorer.
  const { data, error } = await supabase.from("campaigns").select("*").neq("status", "pending").order("created_at", { ascending: false });
  if (error) console.error("[db] getCampaigns failed:", error.message);
  let joined: Set<string> | undefined;
  if (userId) {
    const { data: m } = await supabase.from("campaign_members").select("campaign_id").eq("user_id", userId);
    joined = new Set((m ?? []).map((r: any) => r.campaign_id));
  }
  return (data ?? []).map((r) => toCampaign(r, joined));
}

export async function getCampaign(slug: string, userId?: string, includePending = false): Promise<Campaign | null> {
  if (!useSupabase)
    return mock.campaigns.find((c) => c.slug === slug && (includePending || c.status !== "pending")) ?? null;
  const supabase = await sb();
  let q = supabase.from("campaigns").select("*").eq("slug", slug);
  // Pending (unapproved) briefs must not be reachable by direct slug either,
  // unless the caller explicitly opts in (brand/admin preview flows).
  if (!includePending) q = q.neq("status", "pending");
  const { data, error } = await q.single();
  if (error) console.error("[db] getCampaign failed:", slug, error.message);
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
  const { data, error } = await supabase.from("bounties").select("*").eq("campaign_id", campaignId);
  if (error) console.error("[db] getBounties failed:", campaignId, error.message);
  return (data ?? []).map(toBounty);
}

// ---------- clip activity (real data, last 52 weeks) ----------

const ACTIVITY_DAYS = 364; // 52 weeks

export interface ClipActivity {
  /** counts[0] = 363 days ago … counts[363] = today */
  counts: number[];
  activeDays: number;
  avgClipsPerDay: number;
}

export async function getClipActivity(userId: string): Promise<ClipActivity> {
  const empty: ClipActivity = {
    counts: Array(ACTIVITY_DAYS).fill(0),
    activeDays: 0,
    avgClipsPerDay: 0,
  };
  let submittedAt: (string | null | undefined)[];
  if (!useSupabase) {
    submittedAt = mock.clips.map((c) => c.submittedAt);
  } else {
    const supabase = await sb();
    const { data, error } = await supabase
      .from("clips")
      .select("submitted_at")
      .eq("user_id", userId);
    if (error) console.error("[db] getClipActivity failed:", userId, error.message);
    submittedAt = (data ?? []).map((r: any) => r.submitted_at);
  }
  const today = new Date();
  const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (ACTIVITY_DAYS - 1));
  const startKey = start.toISOString().slice(0, 10);
  const counts = Array(ACTIVITY_DAYS).fill(0);
  const active = new Set<string>();
  for (const iso of submittedAt) {
    if (!iso) continue;
    const k = String(iso).slice(0, 10);
    if (k < startKey) continue;
    const idx = Math.round(
      (new Date(k + "T00:00:00Z").getTime() - start.getTime()) / 86400000
    );
    if (idx >= 0 && idx < ACTIVITY_DAYS) {
      counts[idx]++;
      active.add(k);
    }
  }
  const activeDays = active.size;
  const total = counts.reduce((a, b) => a + b, 0);
  const avgClipsPerDay = activeDays ? Math.round((total / activeDays) * 10) / 10 : 0;
  return { counts, activeDays, avgClipsPerDay };
}

// ---------- profile ----------

export async function getProfile(userId: string): Promise<ClipperProfile | null> {
  if (!useSupabase) return mock.profile;
  const supabase = await sb();
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) console.error("[db] getProfile failed:", userId, error.message);
  if (!data) return null;
  const profile = toProfile(data);
  const { count, error: countError } = await supabase.from("clips").select("id", { count: "exact", head: true }).eq("user_id", userId);
  if (countError) console.error("[db] getProfile clip count failed:", userId, countError.message);
  profile.clipsSubmitted = count ?? 0;
  const activity = await getClipActivity(userId);
  profile.activeDays = activity.activeDays;
  profile.avgClipsPerDay = activity.avgClipsPerDay;
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
    // Embedded to-many selects have no guaranteed order: pin the latest
    // snapshot explicitly so latestMetrics() reads [0] correctly.
    .order("scanned_at", { ascending: false, referencedTable: "clip_metric_snapshots" })
    .limit(1, { referencedTable: "clip_metric_snapshots" })
    .order("submitted_at", { ascending: false });
  if (campaignId) q = q.eq("campaign_id", campaignId);
  const { data, error } = await q;
  if (error) console.error("[db] getUserClips failed:", userId, error.message);
  return (data ?? []).map(toClip);
}

// ---------- public profiles ----------

export async function getPublicProfile(userId: string): Promise<ClipperProfile | null> {
  if (!useSupabase) {
    const p = mock.profile;
    return p.publicProfile ? p : null;
  }
  const supabase = await sb();
  // PII-safe: read through the public_profiles view (id, display_name,
  // avatar_url only — emails can never leak through this path). The view
  // contains only opted-in public profiles, so a miss means 404.
  const { data, error } = await supabase
    .from("public_profiles")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.error("[db] getPublicProfile failed:", userId, error.message);
    return null;
  }
  if (!data) return null;
  const row = data as any;
  return {
    id: row.id,
    provider: "google",
    email: "",
    displayName: row.display_name ?? "Clipper",
    bio: null,
    avatarUrl: row.avatar_url ?? "",
    status: "active",
    role: "clipper",
    joinedAt: "",
    publicProfile: true,
    clipsSubmitted: 0,
    avgClipsPerDay: 0,
    activeDays: 0,
  };
}

export async function getPublicClips(userId: string): Promise<Clip[]> {
  // Public profiles must show clips to visitors (RLS "own clips" blocks this),
  // so use the service role. Only approved clips are public.
  if (!useSupabase) return mock.clips.filter((c: any) => c.userId === userId);
  const { createServiceClient } = await import("./supabase/service");
  const svc = createServiceClient();
  if (!svc) return [];
  const { data, error } = await svc
    .from("clips")
    .select(CLIP_SELECT)
    .eq("user_id", userId)
    .eq("tracking_status", "approved")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("[db] getPublicClips failed:", userId, error.message);
    return [];
  }
  return (data ?? []).map(toClip);
}

// ---------- payouts ----------

export async function getUserPayouts(userId: string): Promise<PayoutCycle[]> {
  if (!useSupabase) return mock.payoutCycles;
  const supabase = await sb();
  const { data, error } = await supabase
    .from("payouts")
    .select("estimated_amount, status, payout_cycles!inner(id, cycle_number, period_start, period_end, snapshot_at, status, campaigns!inner(id, name))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) console.error("[db] getUserPayouts failed:", userId, error.message);
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
  const { data, error } = await supabase.from("payment_methods").select("*").eq("user_id", userId).order("created_at");
  if (error) console.error("[db] getUserPaymentMethods failed:", userId, error.message);
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
  const { data, error } = await supabase.from("social_accounts").select("*").eq("user_id", userId).order("connected_at");
  if (error) console.error("[db] getUserSocialAccounts failed:", userId, error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id, platform: r.platform, handle: r.handle, verified: r.verified,
    verificationCode: r.verification_code ?? "",
    followerCount: r.follower_count ?? 0,
    verifiedAt: r.verified_at,
  }));
}

// ---------- teams ----------

export async function getUserTeams(userId: string): Promise<Team[]> {
  if (!useSupabase) return mock.teams;
  const supabase = await sb();
  const { data, error } = await supabase.from("teams").select("id, name, referral_code").eq("owner_id", userId);
  if (error) console.error("[db] getUserTeams failed:", userId, error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id, name: r.name, referralCode: r.referral_code, members: 0, commissionEarned: 0,
  }));
}

// ---------- brand funding status ----------

/**
 * Whether a brand has deposited funds (sum of brand_topups > 0).
 * Powers the "Verified funds" badge on campaign cards — clippers can see
 * the money exists before they post. Uses the service role because
 * brand_topups is not clipper-readable under RLS.
 * Fails silently (returns false) so a badge never blocks rendering.
 */
export async function getBrandFundedStatus(brandId: string): Promise<boolean> {
  if (!useSupabase || !brandId) return false;
  try {
    const { createServiceClient } = await import("./supabase/service");
    const svc = createServiceClient();
    if (!svc) return false;
    const { data, error } = await svc
      .from("brand_topups")
      .select("amount")
      .eq("brand_id", brandId);
    if (error) return false;
    const total = (data ?? []).reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0);
    return total > 0;
  } catch {
    return false;
  }
}

/**
 * Batch version for campaign lists — returns the set of brand ids
 * that have deposited funds. One query instead of N.
 */
export async function getFundedBrandIds(brandIds: string[]): Promise<Set<string>> {
  const funded = new Set<string>();
  if (!useSupabase || brandIds.length === 0) return funded;
  try {
    const { createServiceClient } = await import("./supabase/service");
    const svc = createServiceClient();
    if (!svc) return funded;
    const { data, error } = await svc
      .from("brand_topups")
      .select("brand_id, amount")
      .in("brand_id", [...new Set(brandIds)]);
    if (error) return funded;
    const totals = new Map<string, number>();
    for (const t of data ?? []) {
      const id = (t as any).brand_id as string;
      totals.set(id, (totals.get(id) ?? 0) + Number((t as any).amount ?? 0));
    }
    for (const [id, total] of totals) {
      if (total > 0) funded.add(id);
    }
  } catch {
    // fail silently — no badge is better than a broken page
  }
  return funded;
}
