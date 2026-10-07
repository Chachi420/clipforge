// Data-access layer. Uses Supabase when configured, otherwise the demo
// dataset in lib/mock.ts. Every function returns the same shape either way,
// so pages never care which backend is active.
import * as mock from "./mock";
import type { Bounty, Campaign, Clip } from "./types";

const useSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function isLive() {
  return useSupabase;
}

function toCampaign(row: any): Campaign {
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
    rules: row.rules, isJoined: row.is_joined ?? false,
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

function toClip(row: any): Clip {
  const views = row.views ?? 0, likes = row.likes ?? 0, comments = row.comments ?? 0;
  return {
    id: row.id, campaignId: row.campaign_id, bountyId: row.bounty_id,
    platform: row.platform, postUrl: row.post_url, accountHandle: row.account_handle,
    streamerName: row.streamer_name, trackingStatus: row.tracking_status,
    views, likes, comments,
    engagementPct: views ? Math.round(((likes + comments) / views) * 1000) / 10 : 0,
    payout: Number(row.payout ?? 0), submittedAt: row.submitted_at,
  };
}

async function sb() {
  const { createClient } = await import("./supabase/server");
  return createClient();
}

export async function getCampaigns(): Promise<Campaign[]> {
  if (!useSupabase) return mock.campaigns;
  const supabase = await sb();
  const { data } = await supabase.from("campaigns").select("*").order("created_at", { ascending: false });
  return (data ?? []).map(toCampaign);
}

export async function getCampaign(slug: string): Promise<Campaign | null> {
  if (!useSupabase) return mock.campaigns.find((c) => c.slug === slug) ?? null;
  const supabase = await sb();
  const { data } = await supabase.from("campaigns").select("*").eq("slug", slug).single();
  return data ? toCampaign(data) : null;
}

export async function getBounties(campaignId: string): Promise<Bounty[]> {
  if (!useSupabase) return mock.bounties.filter((b) => b.campaignId === campaignId);
  const supabase = await sb();
  const { data } = await supabase.from("bounties").select("*").eq("campaign_id", campaignId);
  return (data ?? []).map(toBounty);
}

export async function getClips(campaignId?: string): Promise<Clip[]> {
  if (!useSupabase)
    return campaignId ? mock.clips.filter((c) => c.campaignId === campaignId) : mock.clips;
  const supabase = await sb();
  let q = supabase.from("clips").select("*").order("submitted_at", { ascending: false });
  if (campaignId) q = q.eq("campaign_id", campaignId);
  const { data } = await q;
  return (data ?? []).map(toClip);
}
