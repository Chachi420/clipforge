/**
 * Real content for the marketing pages: the brands running live campaigns
 * (scrolling brand strip) and the best-performing approved clips (photo
 * wall + playable clip row). Everything here is public already — live
 * campaigns are publicly readable and clips are public YouTube posts — and
 * no clipper names or emails are returned.
 *
 * Server-only (uses the service role to read approved clips, which RLS
 * scopes to their owners). Never import from client components.
 */
import { createServiceClient } from "./supabase/service";
import { extractYouTubeVideoId } from "./youtube";
import { safeHref } from "./safe-url";
import * as mock from "./mock";

export interface ShowcaseBrand {
  name: string;
  logoUrl?: string;
  ratePer100k?: number;
  /** Has an active campaign now. Paused/past brands show without a rate. */
  live: boolean;
}

export interface ShowcaseClip {
  id: string;
  videoId: string;
  thumbUrl: string;
  views: number;
  campaignName: string;
  postUrl: string;
}

/**
 * Brands that have run public campaigns on Wondeed: active and paused
 * (never pending briefs or invite-only "private" ones). Live brands come
 * first, best-paying first, one entry per brand. Only live brands show a
 * rate, so a paused campaign never advertises pay it isn't offering.
 */
export async function getShowcaseBrands(limit = 24): Promise<ShowcaseBrand[]> {
  const svc = createServiceClient();
  if (!svc) {
    // Demo mode (no Supabase): mock campaigns so the strip can be previewed.
    return (mock.campaigns as any[])
      .filter((c) => c.status === "active" || c.status === "paused")
      .map((c) => ({
        name: c.name,
        live: c.status === "active",
        ratePer100k: c.status === "active" ? c.ratePer100k : undefined,
      }));
  }
  try {
    const { data, error } = await svc
      .from("campaigns")
      .select("name, status, icon_url, rate_per_100k, brands(name, logo_url)")
      .in("status", ["active", "paused"])
      .order("rate_per_100k", { ascending: false })
      .limit(200);
    if (error) throw error;
    const rows = ((data ?? []) as any[]).sort(
      (a, b) => Number(b.status === "active") - Number(a.status === "active")
    );
    const seen = new Set<string>();
    const out: ShowcaseBrand[] = [];
    for (const row of rows) {
      const name: string = (row.brands?.name || row.name || "").trim();
      if (!name || seen.has(name.toLowerCase())) continue;
      seen.add(name.toLowerCase());
      const live = row.status === "active";
      out.push({
        name,
        live,
        logoUrl: safeHref(row.brands?.logo_url || row.icon_url),
        ratePer100k: live ? Number(row.rate_per_100k) || undefined : undefined,
      });
      if (out.length >= limit) break;
    }
    return out;
  } catch (e) {
    console.error("[showcase] brands failed:", (e as Error).message);
    return [];
  }
}

/** Most-viewed approved YouTube clips on live campaigns. */
export async function getShowcaseClips(limit = 18): Promise<ShowcaseClip[]> {
  const svc = createServiceClient();
  if (!svc) return [];
  try {
    const { data: clips, error } = await svc
      .from("clips")
      .select("id, post_url, campaigns!inner(name, status)")
      .eq("tracking_status", "tracking")
      .eq("platform", "youtube")
      .eq("campaigns.status", "active")
      .order("submitted_at", { ascending: false })
      .limit(300);
    if (error) throw error;
    const rows = ((clips ?? []) as any[])
      .map((c) => ({ ...c, videoId: extractYouTubeVideoId(c.post_url) }))
      .filter((c) => c.videoId && safeHref(c.post_url));
    if (rows.length === 0) return [];

    // Latest view snapshot per clip.
    const { data: snaps } = await svc
      .from("clip_metric_snapshots")
      .select("clip_id, views, scanned_at")
      .in("clip_id", rows.map((r) => r.id))
      .order("scanned_at", { ascending: false })
      .limit(5000);
    const views = new Map<string, number>();
    for (const s of (snaps ?? []) as any[]) {
      if (!views.has(s.clip_id)) views.set(s.clip_id, Number(s.views) || 0);
    }

    const seenVideo = new Set<string>();
    return rows
      .map((r) => ({
        id: r.id as string,
        videoId: r.videoId as string,
        thumbUrl: `https://i.ytimg.com/vi/${r.videoId}/hqdefault.jpg`,
        views: views.get(r.id) ?? 0,
        campaignName: r.campaigns?.name ?? "",
        postUrl: r.post_url as string,
      }))
      .sort((a, b) => b.views - a.views)
      .filter((c) => (seenVideo.has(c.videoId) ? false : (seenVideo.add(c.videoId), true)))
      .slice(0, limit);
  } catch (e) {
    console.error("[showcase] clips failed:", (e as Error).message);
    return [];
  }
}
