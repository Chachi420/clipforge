// Brand-side data access. Mirrors lib/db.ts conventions: Supabase when
// configured, honest empty/demo shapes otherwise. All functions are
// brand-scoped — callers must pass a verified brandId.
import { isLive } from "./db";
import type {
  Brand, BrandCampaign, BrandKpis, BrandTopup, CampaignClipperRow, Clip,
} from "./types";

const DEMO_BRAND: Brand = {
  id: "demo-brand",
  ownerId: "demo",
  name: "Demo Brand",
  logoUrl: "",
  contactEmail: "",
  createdAt: new Date().toISOString().slice(0, 10),
};

async function sb() {
  const { createClient } = await import("./supabase/server");
  return createClient();
}

function toBrand(row: any): Brand {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    logoUrl: row.logo_url ?? "",
    contactEmail: row.contact_email ?? "",
    createdAt: (row.created_at ?? "").slice(0, 10),
  };
}

function toTopup(row: any): BrandTopup {
  return {
    id: row.id,
    brandId: row.brand_id,
    amount: Number(row.amount ?? 0),
    method: row.method ?? null,
    reference: row.reference ?? null,
    recordedBy: row.recorded_by ?? null,
    createdAt: row.created_at ?? "",
  };
}

/** Brand row for the signed-in user, or null. */
export async function getBrand(userId: string): Promise<Brand | null> {
  if (!isLive()) return DEMO_BRAND;
  const supabase = await sb();
  const { data } = await supabase.from("brands").select("*").eq("owner_id", userId).single();
  return data ? toBrand(data) : null;
}

/** Raw role string from profiles (clipper | brand | admin). */
export async function getUserRole(userId: string): Promise<string> {
  if (!isLive()) return "brand";
  const supabase = await sb();
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).single();
  return (data as any)?.role ?? "clipper";
}

interface CampaignAgg {
  views: number;
  clips: number;
  clippers: number;
  spend: number;
}

async function campaignAggs(
  supabase: any,
  campaignIds: string[],
  rateById: Map<string, number>
): Promise<Map<string, CampaignAgg>> {
  const out = new Map<string, CampaignAgg>();
  if (campaignIds.length === 0) return out;
  // Latest snapshot per clip (views), clip counts, distinct clippers.
  const { data: clips } = await supabase
    .from("clips")
    .select("id, campaign_id, user_id, clip_metric_snapshots(views)")
    .in("campaign_id", campaignIds);
  const byCampaign = new Map<string, any[]>();
  for (const c of clips ?? []) {
    const arr = byCampaign.get(c.campaign_id) ?? [];
    arr.push(c);
    byCampaign.set(c.campaign_id, arr);
  }
  for (const [cid, rows] of byCampaign) {
    let views = 0;
    const clippers = new Set<string>();
    for (const r of rows) {
      const s = Array.isArray(r.clip_metric_snapshots)
        ? r.clip_metric_snapshots[0]
        : r.clip_metric_snapshots;
      views += Number(s?.views ?? 0);
      clippers.add(r.user_id);
    }
    out.set(cid, {
      views,
      clips: rows.length,
      clippers: clippers.size,
      spend: (views / 100000) * (rateById.get(cid) ?? 0),
    });
  }
  return out;
}

function toBrandCampaign(row: any, agg?: CampaignAgg): BrandCampaign {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    iconUrl: row.icon_url ?? "",
    status: row.status,
    type: row.type,
    category: row.category,
    platforms: row.platforms,
    payoutMethod: row.payout_method,
    ratePer100k: Number(row.rate_per_100k),
    platformRates: row.platform_rates ?? undefined,
    minViewsPerPost: row.min_views_per_post,
    minViewsTotal: row.min_views_total,
    daysLeft: row.days_left,
    startDate: row.start_date,
    budgetCap: row.budget_cap ?? undefined,
    durationMode: row.duration_mode,
    payoutMode: row.payout_mode,
    potValue: row.pot_value ?? undefined,
    bountyPot: row.bounty_pot ?? undefined,
    accountLimit: row.account_limit ?? undefined,
    rules: row.rules,
    brandId: row.brand_id ?? null,
    spend: agg?.spend ?? 0,
    totalViews: agg?.views ?? 0,
    clipCount: agg?.clips ?? 0,
    clipperCount: agg?.clippers ?? 0,
  };
}

/** All campaigns owned by a brand, newest first, with aggregates. */
export async function getBrandCampaigns(brandId: string): Promise<BrandCampaign[]> {
  if (!isLive()) return [];
  const supabase = await sb();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });
  const rows = data ?? [];
  const rateById = new Map(rows.map((r: any) => [r.id, Number(r.rate_per_100k ?? 0)]));
  const aggs = await campaignAggs(supabase, rows.map((r: any) => r.id), rateById);
  return rows.map((r: any) => toBrandCampaign(r, aggs.get(r.id)));
}

/** One campaign by slug, verified to belong to the brand. */
export async function getBrandCampaign(
  brandId: string,
  slug: string
): Promise<BrandCampaign | null> {
  if (!isLive()) return null;
  const supabase = await sb();
  const { data } = await supabase
    .from("campaigns")
    .select("*")
    .eq("brand_id", brandId)
    .eq("slug", slug)
    .single();
  if (!data) return null;
  const aggs = await campaignAggs(
    supabase,
    [data.id],
    new Map([[data.id, Number(data.rate_per_100k ?? 0)]])
  );
  return toBrandCampaign(data, aggs.get(data.id));
}

export async function getBrandKpis(brandId: string): Promise<BrandKpis> {
  const zero: BrandKpis = { activeCampaigns: 0, spendMtd: 0, viewsMtd: 0, avgEcpm: 0 };
  if (!isLive()) return zero;
  const campaigns = await getBrandCampaigns(brandId);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const supabase = await sb();
  const ids = campaigns.map((c) => c.id);
  let viewsMtd = 0;
  let spendMtd = 0;
  if (ids.length > 0) {
    // Views gained this month = latest snapshot views − earliest snapshot views
    // within the month window, per clip.
    const { data: clips } = await supabase
      .from("clips")
      .select("id, campaign_id")
      .in("campaign_id", ids);
    const clipIds = (clips ?? []).map((c: any) => c.id);
    const campaignByClip = new Map((clips ?? []).map((c: any) => [c.id, c.campaign_id]));
    const rateById = new Map(campaigns.map((c) => [c.id, c.ratePer100k]));
    if (clipIds.length > 0) {
      const { data: snaps } = await supabase
        .from("clip_metric_snapshots")
        .select("clip_id, views, scanned_at")
        .in("clip_id", clipIds)
        .gte("scanned_at", monthStart.toISOString())
        .order("scanned_at", { ascending: true });
      const byClip = new Map<string, number[]>();
      for (const s of snaps ?? []) {
        const arr = byClip.get(s.clip_id) ?? [];
        arr.push(Number(s.views ?? 0));
        byClip.set(s.clip_id, arr);
      }
      const spendByCampaign = new Map<string, number>();
      for (const [clipId, vs] of byClip) {
        if (vs.length === 0) continue;
        const gained = Math.max(0, vs[vs.length - 1] - vs[0]);
        viewsMtd += gained;
        const cid = campaignByClip.get(clipId)!;
        spendByCampaign.set(
          cid,
          (spendByCampaign.get(cid) ?? 0) + (gained / 100000) * (rateById.get(cid) ?? 0)
        );
      }
      spendMtd = Array.from(spendByCampaign.values()).reduce((a, b) => a + b, 0);
    }
  }
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  return {
    activeCampaigns,
    spendMtd,
    viewsMtd,
    avgEcpm: viewsMtd > 0 ? (spendMtd / viewsMtd) * 1000 : 0,
  };
}

/** Top clips for a campaign by latest verified views (brand-verified ownership). */
export async function getCampaignClips(
  brandId: string,
  campaignId: string,
  limit = 50
): Promise<Clip[]> {
  if (!isLive()) return [];
  const supabase = await sb();
  const { data: camp } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("brand_id", brandId)
    .single();
  if (!camp) return [];
  const { data } = await supabase
    .from("clips")
    .select(
      "id, campaign_id, bounty_id, platform, post_url, account_handle, streamer_name, tracking_status, submitted_at, clip_metric_snapshots(views, likes, comments)"
    )
    .eq("campaign_id", campaignId)
    .order("submitted_at", { ascending: false })
    .limit(limit * 2);
  const rows = (data ?? []).map((r: any) => {
    const s = Array.isArray(r.clip_metric_snapshots)
      ? r.clip_metric_snapshots[0]
      : r.clip_metric_snapshots;
    const views = Number(s?.views ?? 0);
    const likes = Number(s?.likes ?? 0);
    const comments = Number(s?.comments ?? 0);
    return {
      id: r.id,
      campaignId: r.campaign_id,
      bountyId: r.bounty_id,
      platform: r.platform,
      postUrl: r.post_url,
      accountHandle: r.account_handle,
      streamerName: r.streamer_name,
      trackingStatus: r.tracking_status,
      views,
      likes,
      comments,
      engagementPct: views ? Math.round(((likes + comments) / views) * 1000) / 10 : 0,
      payout: 0,
      submittedAt: r.submitted_at,
    } as Clip;
  });
  rows.sort((a, b) => b.views - a.views);
  return rows.slice(0, limit);
}

/** Per-clipper rollup for a campaign (brand-verified ownership). */
export async function getCampaignClippers(
  brandId: string,
  campaignId: string
): Promise<CampaignClipperRow[]> {
  if (!isLive()) return [];
  const supabase = await sb();
  const { data: camp } = await supabase
    .from("campaigns")
    .select("id, rate_per_100k")
    .eq("id", campaignId)
    .eq("brand_id", brandId)
    .single();
  if (!camp) return [];
  const rate = Number((camp as any).rate_per_100k ?? 0);
  const { data: clips } = await supabase
    .from("clips")
    .select("user_id, clip_metric_snapshots(views), profiles!inner(display_name, email)")
    .eq("campaign_id", campaignId);
  const byUser = new Map<string, { name: string; email: string; clips: number; views: number }>();
  for (const c of clips ?? []) {
    const u = byUser.get(c.user_id) ?? {
      name: (c as any).profiles?.display_name ?? "Clipper",
      email: (c as any).profiles?.email ?? "",
      clips: 0,
      views: 0,
    };
    const s = Array.isArray(c.clip_metric_snapshots)
      ? c.clip_metric_snapshots[0]
      : c.clip_metric_snapshots;
    u.clips += 1;
    u.views += Number(s?.views ?? 0);
    byUser.set(c.user_id, u);
  }
  return Array.from(byUser.entries())
    .map(([userId, u]) => ({
      userId,
      displayName: u.name,
      email: u.email,
      clips: u.clips,
      views: u.views,
      earnings: (u.views / 100000) * rate,
    }))
    .sort((a, b) => b.views - a.views);
}

export interface DayPoint {
  date: string;
  views: number;
  spend: number;
}

/** Daily verified-views & spend for the last N days (brand-verified ownership). */
export async function getViewsTimeseries(
  brandId: string,
  campaignId: string,
  days = 30
): Promise<DayPoint[]> {
  const out: DayPoint[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), views: 0, spend: 0 });
  }
  if (!isLive()) return out;
  const supabase = await sb();
  const { data: camp } = await supabase
    .from("campaigns")
    .select("id, rate_per_100k")
    .eq("id", campaignId)
    .eq("brand_id", brandId)
    .single();
  if (!camp) return out;
  const rate = Number((camp as any).rate_per_100k ?? 0);
  const since = new Date(today);
  since.setDate(since.getDate() - days);
  const { data: clips } = await supabase
    .from("clips")
    .select("id")
    .eq("campaign_id", campaignId);
  const clipIds = (clips ?? []).map((c: any) => c.id);
  if (clipIds.length === 0) return out;
  const { data: snaps } = await supabase
    .from("clip_metric_snapshots")
    .select("clip_id, views, scanned_at")
    .in("clip_id", clipIds)
    .gte("scanned_at", since.toISOString())
    .order("scanned_at", { ascending: true });
  // Per clip per day: max views that day; daily gain = max(today) − max(yesterday).
  const maxByClipDay = new Map<string, number>();
  for (const s of snaps ?? []) {
    const day = (s.scanned_at as string).slice(0, 10);
    const k = `${s.clip_id}|${day}`;
    maxByClipDay.set(k, Math.max(maxByClipDay.get(k) ?? 0, Number(s.views ?? 0)));
  }
  const byDay = new Map(out.map((d) => [d.date, d]));
  const prevMax = new Map<string, number>();
  for (const d of out) {
    for (const cid of clipIds) {
      const m = maxByClipDay.get(`${cid}|${d.date}`);
      if (m === undefined) continue;
      const prev = prevMax.get(cid) ?? 0;
      const gain = Math.max(0, m - prev);
      d.views += gain;
      prevMax.set(cid, m);
    }
    d.spend = (d.views / 100000) * rate;
  }
  return out.filter((d) => byDay.has(d.date));
}

// ---------- billing ----------

export async function getBrandTopups(brandId: string): Promise<BrandTopup[]> {
  if (!isLive()) return [];
  const supabase = await sb();
  const { data } = await supabase
    .from("brand_topups")
    .select("*")
    .eq("brand_id", brandId)
    .order("created_at", { ascending: false });
  return (data ?? []).map(toTopup);
}

export async function getBrandBalance(
  brandId: string
): Promise<{ funded: number; spent: number; balance: number }> {
  if (!isLive()) return { funded: 0, spent: 0, balance: 0 };
  const [topups, campaigns] = await Promise.all([
    getBrandTopups(brandId),
    getBrandCampaigns(brandId),
  ]);
  const funded = topups.reduce((s, t) => s + t.amount, 0);
  const spent = campaigns.reduce((s, c) => s + c.spend, 0);
  return { funded, spent, balance: funded - spent };
}
