import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { extractYouTubeVideoId, fetchVideoStats } from "@/lib/youtube";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface ScanResult {
  scanned: number;
  youtubeUpdated: number;
  skipped: { tiktok: number; x: number; instagram: number };
  errors: string[];
}

export async function GET(request: NextRequest) {
  // Auth: CRON_SECRET via Bearer header when set. Vercel Cron cannot send
  // custom headers, so its own user-agent (vercel-cron/1.0) is also accepted —
  // obscurity-level protection, acceptable because the job only appends
  // idempotent metric snapshots (no destructive or financial effects).
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = request.headers.get("authorization") ?? "";
    const ua = request.headers.get("user-agent") ?? "";
    const viaSecret = header === `Bearer ${secret}`;
    const viaVercelCron = ua.toLowerCase().startsWith("vercel-cron/");
    if (!viaSecret && !viaVercelCron) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
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
    skipped: { tiktok: 0, x: 0, instagram: 0 },
    errors: [],
  };

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
      result.skipped.instagram += 1;
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
        return { clip_id: c.id, views: s.views, likes: s.likes, comments: s.comments };
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

  return NextResponse.json(result);
}
