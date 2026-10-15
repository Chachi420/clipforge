// Apify helpers for fetching Instagram reel/post view counts.
// Requires APIFY_API_TOKEN. Everything degrades to empty results when the
// token is missing or Apify fails, so callers never break — same pattern
// as lib/youtube.ts.
//
// NOTE: this scrapes public Instagram pages via Apify's instagram-scraper
// actor. Instagram's ToS prohibits scraping; Apify absorbs the operational
// side, but the actor can break or get rate-limited when Instagram changes
// things. Treat results as best-effort, never as audited truth. Metrics
// are never fabricated — missing data stays missing.

const API = "https://api.apify.com/v2";
const ACTOR_ID = "apify~instagram-scraper";

// Max Instagram clips fetched per scan — bounds Apify cost per run.
const MAX_URLS_PER_RUN = 50;
// How long to wait for the actor run before giving up (ms).
const RUN_TIMEOUT_MS = 240_000;

function token(): string | null {
  return process.env.APIFY_API_TOKEN || null;
}

function num(v: unknown): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normUrl(u: string): string {
  return u.trim().replace(/\/+$/, "").toLowerCase();
}

export interface InstagramStats {
  views: number | null;
  likes: number | null;
  comments: number | null;
}

async function api(path: string, t: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch view/like/comment counts for public Instagram post/reel URLs.
 * Returns a map keyed by the input URL (normalized). Empty map = no data;
 * callers must treat that as "skipped", not zero.
 */
export async function fetchInstagramStats(
  urls: string[]
): Promise<Map<string, InstagramStats>> {
  const out = new Map<string, InstagramStats>();
  const t = token();
  const targets = [...new Set(urls.map((u) => u.trim()).filter(Boolean))].slice(
    0,
    MAX_URLS_PER_RUN
  );
  if (!t || targets.length === 0) return out;

  try {
    // 1. Start the actor run (async — we poll for completion below).
    const run = await api(`/acts/${ACTOR_ID}/runs`, t, {
      method: "POST",
      body: JSON.stringify({
        directUrls: targets,
        resultsType: "posts",
        resultsLimit: targets.length,
      }),
    });
    const runId: string | undefined = run?.data?.id;
    const datasetId: string | undefined = run?.data?.defaultDatasetId;
    if (!runId || !datasetId) return out;

    // 2. Poll until the run finishes (or we time out).
    const deadline = Date.now() + RUN_TIMEOUT_MS;
    let status = "";
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 5000));
      const check = await api(`/actor-runs/${runId}`, t);
      status = check?.data?.status || "";
      if (["SUCCEEDED", "FAILED", "TIMED-OUT", "ABORTED"].includes(status)) break;
    }
    if (status !== "SUCCEEDED") return out;

    // 3. Read the dataset items.
    const items = await api(
      `/datasets/${datasetId}/items?clean=true&limit=${targets.length}`,
      t
    );
    if (!Array.isArray(items)) return out;

    const byUrl = new Map<string, string>();
    for (const u of targets) byUrl.set(normUrl(u), u);

    for (const item of items) {
      const raw = String(item?.url || item?.shortCode || "");
      if (!raw) continue;
      // Match by full URL or by shortcode appearing in the input URL.
      let key: string | undefined = byUrl.get(normUrl(raw));
      if (!key && item?.shortCode) {
        const sc = String(item.shortCode).toLowerCase();
        key = targets.find((u) => u.toLowerCase().includes(sc));
      }
      if (!key) continue;
      out.set(key, {
        // Reels expose videoViewCount; image posts have no view count —
        // leave it null rather than inventing one from likes.
        views: num(item.videoViewCount ?? item.videoPlayCount),
        likes: num(item.likesCount),
        comments: num(item.commentsCount),
      });
    }
  } catch {
    // Best-effort: any failure means "no data", handled by the caller.
  }
  return out;
}
