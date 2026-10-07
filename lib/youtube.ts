// YouTube Data API v3 helpers for account verification and upload checks.
// Requires YOUTUBE_API_KEY (free quota). All functions return null when the
// key is missing so callers can degrade gracefully.
const API = "https://www.googleapis.com/youtube/v3";
export const MIN_FOLLOWERS = 1000;

function apiKey(): string | null {
  return process.env.YOUTUBE_API_KEY || null;
}

async function yt(path: string, params: Record<string, string>) {
  const key = apiKey();
  if (!key) return null;
  const q = new URLSearchParams({ ...params, key });
  const res = await fetch(`${API}${path}?${q.toString()}`, { next: { revalidate: 0 } });
  if (!res.ok) return null;
  return res.json();
}

export interface ChannelInfo {
  channelId: string;
  title: string;
  handle: string; // e.g. "@mkbhd"
  description: string;
  subscribers: number;
}

/** Resolve a channel by handle ("@mkbhd" or "mkbhd"). */
export async function resolveChannelByHandle(handle: string): Promise<ChannelInfo | null> {
  const h = handle.replace(/^@/, "").trim();
  if (!h) return null;
  const data = await yt("/channels", { part: "snippet,statistics", forHandle: h });
  const item = data?.items?.[0];
  if (!item) return null;
  return {
    channelId: item.id,
    title: item.snippet?.title ?? "",
    handle: item.snippet?.customUrl ?? `@${h}`,
    description: item.snippet?.description ?? "",
    subscribers: Number(item.statistics?.subscriberCount ?? 0),
  };
}

/** Resolve the owning channel of a video/shorts ID. */
export async function resolveVideoChannel(videoId: string): Promise<string | null> {
  const data = await yt("/videos", { part: "snippet", id: videoId });
  const item = data?.items?.[0];
  return item?.snippet?.channelId ?? null;
}

/**
 * Verify a YouTube account: bio must contain the verification code and the
 * channel must have >= MIN_FOLLOWERS subscribers.
 */
export async function verifyYouTubeAccount(
  handle: string,
  code: string
): Promise<{ ok: true; channel: ChannelInfo } | { ok: false; reason: string }> {
  if (!apiKey()) {
    return { ok: false, reason: "YouTube verification is not configured yet. Try again later." };
  }
  const channel = await resolveChannelByHandle(handle);
  if (!channel) {
    return { ok: false, reason: `Could not find a YouTube channel for "${handle}". Check the handle.` };
  }
  if (!channel.description.toLowerCase().includes(code.toLowerCase())) {
    return {
      ok: false,
      reason: `The code ${code} was not found in the channel bio. Add it to your YouTube channel description, wait a minute, then try again.`,
    };
  }
  if (channel.subscribers < MIN_FOLLOWERS) {
    return {
      ok: false,
      reason: `This channel has ${channel.subscribers.toLocaleString()} subscribers — at least ${MIN_FOLLOWERS.toLocaleString()} are required.`,
    };
  }
  return { ok: true, channel };
}

/** Extract a video ID from a YouTube / Shorts URL. */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    const shorts = u.pathname.match(/^\/shorts\/([\w-]{6,})/);
    if (shorts) return shorts[1];
    const v = u.searchParams.get("v");
    if (v) return v;
    return null;
  } catch {
    return null;
  }
}

/** Extract author handle from a TikTok video URL via no-key oEmbed. */
export async function resolveTikTokAuthor(postUrl: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(postUrl)}`,
      { next: { revalidate: 0 }, headers: { "User-Agent": "Mozilla/5.0" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const name: string = data?.author_name ?? "";
    return name.replace(/^@/, "").toLowerCase() || null;
  } catch {
    return null;
  }
}

/** Extract handle from an X/Twitter status URL. */
export function extractXHandle(postUrl: string): string | null {
  try {
    const u = new URL(postUrl);
    if (!/(^|\.)(x|twitter)\.com$/.test(u.hostname)) return null;
    const m = u.pathname.match(/^\/([^/]+)\/status\//i);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

/** Extract handle from a TikTok video URL path. */
export function extractTikTokHandle(postUrl: string): string | null {
  try {
    const u = new URL(postUrl);
    if (!u.hostname.includes("tiktok.com")) return null;
    const m = u.pathname.match(/\/@([^/]+)/);
    return m ? m[1].toLowerCase() : null;
  } catch {
    return null;
  }
}

export interface VideoStats {
  views: number;
  likes: number;
  comments: number;
}

/**
 * Fetch view/like/comment stats for YouTube video IDs via videos.list.
 * Batches up to 50 IDs per request. Returns an empty map when YOUTUBE_API_KEY
 * is missing. Only real API numbers are ever returned — never invented.
 */
export async function fetchVideoStats(videoIds: string[]): Promise<Map<string, VideoStats>> {
  const out = new Map<string, VideoStats>();
  const key = apiKey();
  const ids = Array.from(new Set(videoIds.filter(Boolean)));
  if (!key || ids.length === 0) return out;
  for (let i = 0; i < ids.length; i += 50) {
    const batch = ids.slice(i, i + 50);
    const q = new URLSearchParams({ part: "statistics", id: batch.join(","), key });
    let res: Response;
    try {
      res = await fetch(`${API}/videos?${q.toString()}`, { next: { revalidate: 0 } });
    } catch {
      continue; // network error: skip this batch, keep going
    }
    if (!res.ok) continue; // quota/API error: skip batch, never fabricate
    let data: any;
    try {
      data = await res.json();
    } catch {
      continue;
    }
    for (const item of data?.items ?? []) {
      const st = item?.statistics;
      if (!st) continue;
      out.set(item.id, {
        views: Number(st.viewCount ?? 0),
        likes: Number(st.likeCount ?? 0),
        comments: Number(st.commentCount ?? 0),
      });
    }
  }
  return out;
}
