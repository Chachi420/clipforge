import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { extractYouTubeVideoId, fetchVideoStats } from "@/lib/youtube";
import { fetchInstagramStats } from "@/lib/apify";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface ScanResult {
  scanned: number;
  youtubeUpdated: number;
  instagramUpdated: number;
  skipped: { tiktok: number; x: number; instagram: number };
  daysLeftTicked: number;
  errors: string[];
}

export async function GET(request: NextRequest) {
  // Fail closed: without CRON_SECRET there is no way to authenticate the
  // caller, so refuse to run. Vercel Cron sends
  // `Authorization: Bearer <CRON_SECRET>` automatically when the env var is
  // set — no User-Agent sniffing (anyone can forge a User-Agent header).
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Cron is not configured (CRON_SECRET missing)" },
      { status: 503 }
    );
  }
  const header = request.headers.get("authorization") ?? "";
  if (header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase service client not configured" },
      { status: 503 }
    );
  }

  const result: ScanResult = {
    scanned: 0,
    youtubeUpdated: 0,
    instagramUpdated: 0,
    skipped: { tiktok: 0, x: 0, instagram: 0 },
    daysLeftTicked: 0,
    errors: [],
  };

  // Once-daily tick: this route runs every 30 min, so gating on UTC hour 0
  // fires ~once per day (vercel.json: 0 2 * * * = 02:00 UTC).
  // Decrement days_left on active campaigns; a campaign
  // that reaches 0 is auto-paused (brands/admins can resume it manually).
  if (new Date().getUTCHours() === 2) {
    const { data: ticking, error: tickError } = await supabase
      .from("campaigns")
      .select("id, days_left")
      .eq("status", "active")
      .gt("days_left", 0);
    if (tickError) {
      result.errors.push(`days_left tick failed: ${tickError.message}`);
    } else {
      for (const c of ticking ?? []) {
        const next = Math.max(0, (c.days_left ?? 1) - 1);
        const { error: updError } = await supabase
          .from("campaigns")
          .update(next === 0 ? { days_left: 0, status: "paused" } : { days_left: next })
          .eq("id", c.id);
        if (updError) {
          result.errors.push(`days_left tick failed for campaign ${c.id}: ${updError.message}`);
        } else {
          result.daysLeftTicked += 1;
        }
      }
    }
  }

  const { data: clips, error: clipsError } = await supabase
    .from("clips")
    .select("id, platform, post_url")
    .eq("tracking_status", "tracking")
    .order("submitted_at", { ascending: true })
    .limit(500);

  if (clipsError) {
    return NextResponse.json({ error: clipsError.message }, { status: 500 });
  }

  result.scanned = clips?.length ?? 0;

  const youtubeClips: { id: string; videoId: string }[] = [];
  const instagramClips: { id: string; url: string }[] = [];
  for (const clip of clips ?? []) {
    if (clip.platform === "youtube") {
      const videoId = extractYouTubeVideoId(clip.post_url);
      if (videoId) {
        youtubeClips.push({ id: clip.id, videoId });
      } else {
        result.errors.push(`clip ${clip.id}: could not parse YouTube video id from URL`);
      }
    } else if (clip.platform === "tiktok") {
      result.skipped.tiktok += 1;
    } else if (clip.platform === "x") {
      result.skipped.x += 1;
    } else if (clip.platform === "instagram") {
      instagramClips.push({ id: clip.id, url: clip.post_url });
    }
  }

  // YouTube is the only platform with a free, keyed stats API.
  // Other platforms are counted as skipped — metrics are NEVER fabricated.
  if (youtubeClips.length > 0) {
    const stats = await fetchVideoStats(youtubeClips.map((c) => c.videoId));
    if (stats.size === 0) {
      result.errors.push(
        "YouTube stats fetch returned no data (missing YOUTUBE_API_KEY or API error)"
      );
    }
    const rows = youtubeClips
      .filter((c) => stats.has(c.videoId))
      .map((c) => {
        const s = stats.get(c.videoId)!;
        // Columns are NOT NULL — one null poisons the whole batch insert.
        return { clip_id: c.id, views: s.views ?? 0, likes: s.likes ?? 0, comments: s.comments ?? 0 };
      });
    if (rows.length > 0) {
      const { error: insertError } = await supabase
        .from("clip_metric_snapshots")
        .insert(rows);
      if (insertError) {
        result.errors.push(`snapshot insert failed: ${insertError.message}`);
      } else {
        result.youtubeUpdated = rows.length;
      }
    }
    const missing = youtubeClips.length - rows.length;
    if (missing > 0) {
      result.errors.push(
        `${missing} YouTube clip(s) returned no stats (video deleted/private or API error)`
      );
    }
  }

  // Instagram is fetched via Apify's instagram-scraper actor (best-effort
  // scraping of public posts). Without APIFY_API_TOKEN these clips stay
  // skipped — metrics are NEVER fabricated.
  if (instagramClips.length > 0) {
    if (!process.env.APIFY_API_TOKEN) {
      result.skipped.instagram = instagramClips.length;
      result.errors.push(
        "Instagram stats skipped: set APIFY_API_TOKEN to enable Apify fetching"
      );
    } else {
      const stats = await fetchInstagramStats(instagramClips.map((c) => c.url));
      const rows = instagramClips
        .filter((c) => stats.has(c.url))
        .map((c) => {
          const s = stats.get(c.url)!;
          // Columns are NOT NULL — one null poisons the whole batch insert.
          return { clip_id: c.id, views: s.views ?? 0, likes: s.likes ?? 0, comments: s.comments ?? 0 };
        });
      if (rows.length > 0) {
        const { error: insertError } = await supabase
          .from("clip_metric_snapshots")
          .insert(rows);
        if (insertError) {
          result.errors.push(`instagram snapshot insert failed: ${insertError.message}`);
        } else {
          result.instagramUpdated = rows.length;
        }
      }
      const missing = instagramClips.length - rows.length;
      if (missing > 0) {
        result.errors.push(
          `${missing} Instagram clip(s) returned no stats (private/deleted post, or Apify rate limit/breakage)`
        );
      }
    }
  }

  return NextResponse.json(result);
}
