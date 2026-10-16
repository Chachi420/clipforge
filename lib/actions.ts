"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { PLATFORM_LABELS, type Platform, type PayoutMethod } from "./types";
import {
  MIN_FOLLOWERS,
  extractTikTokHandle,
  extractXHandle,
  extractYouTubeVideoId,
  resolveTikTokAuthor,
  resolveVideoChannel,
  verifyYouTubeAccount,
} from "./youtube";

async function authed() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Demo mode: connect Supabase to enable this action.");
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

function detectPlatform(url: string): Platform | null {
  const h = url.toLowerCase();
  if (h.includes("tiktok.com")) return "tiktok";
  if (h.includes("instagram.com")) return "instagram";
  if (h.includes("youtu")) return "youtube";
  if (h.includes("x.com") || h.includes("twitter.com")) return "x";
  // Unknown — never default to a platform; the caller rejects with a
  // clear error instead of mislabeling rubbish as an X link.
  return null;
}

/** How long after a verification code is issued before the automated bio
 *  check may run. Gives the clipper time to add the code to their bio and
 *  bounds Apify spend on instant re-clicks. */
const BIO_CHECK_WAIT_MS = 3 * 60 * 1000;

/** Reject malformed URLs before they reach platform-specific parsing. */
function assertValidClipUrl(url: string): void {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error(`That doesn't look like a link: "${url}". Paste the full URL of your post.`);
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error(`That doesn't look like a link: "${url}". Paste the full URL of your post.`);
  }
  if (!detectPlatform(url)) {
    throw new Error(
      `We can't use this link: "${url}". Paste a TikTok, Instagram, YouTube, or X post URL.`
    );
  }
}

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function makeVerificationCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return `CF-${s}`;
}

const norm = (h: string) => h.replace(/^@/, "").toLowerCase();

/** Submit clip URLs to a campaign. Every link must come from one of the
 *  user's verified accounts for that platform, and every clip waits in
 *  `pending_review` until an admin approves it (Wondeed model: approval
 *  for everything). Returns { inserted } or throws. */
export async function uploadClips(campaignId: string, urls: string[]) {
  const { supabase, userId } = await authed();
  const clean = Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean))).slice(0, 25);
  if (clean.length === 0) throw new Error("No URLs provided.");

  // Suspended clippers cannot upload.
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
    .single();
  if ((profile as any)?.status === "suspended") {
    throw new Error("Your account is suspended. You cannot upload new clips while suspended.");
  }

  // The server action is the trust boundary: never trust the client-supplied
  // campaignId. Campaigns are publicly readable, so this check is cheap.
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, status, brand_id, platforms")
    .eq("id", campaignId)
    .single();
  if (campaignError || !campaign) throw new Error("Campaign not found.");
  if ((campaign as any).status !== "active") {
    throw new Error("This campaign is not accepting clips right now.");
  }
  // Platform gate: each clip's platform must be in the campaign's allowed list.
  {
    const allowed = (campaign as any).platforms as string[] | null;
    if (allowed && allowed.length > 0) {
      for (const u of urls) {
        const urlLower = u.toLowerCase();
        let detected: string | null = null;
        if (urlLower.includes("youtube.com") || urlLower.includes("youtu.be")) detected = "youtube";
        else if (urlLower.includes("tiktok.com")) detected = "tiktok";
        else if (urlLower.includes("instagram.com")) detected = "instagram";
        else if (urlLower.includes("x.com") || urlLower.includes("twitter.com")) detected = "x";
        if (detected && !allowed.includes(detected)) {
          throw new Error(`This campaign only accepts ${allowed.join(", ")} clips.`);
        }
      }
    }
  }

  // Balance gate: don't accept clips when the brand has $0 available.
  // brand_topups/payouts are not clipper-readable under RLS, so the
  // service-role client does the sums. FAIL CLOSED: if the service client
  // is unavailable, reject the upload rather than silently skipping the check.
  const { createServiceClient } = await import("./supabase/service");
  const svc = createServiceClient();
  if (!svc) {
    throw new Error("Upload verification unavailable — please try again in a moment.");
  }
  {
    const { data: topups } = await svc.from("brand_topups").select("amount").eq("brand_id", (campaign as any).brand_id);
    const funded = (topups ?? []).reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0);
    const { data: cycles } = await svc
      .from("payout_cycles")
      .select("id, campaigns!inner(brand_id)")
      .eq("campaigns.brand_id", (campaign as any).brand_id);
    const cycleIds = (cycles ?? []).map((c: any) => c.id);
    let spent = 0;
    if (cycleIds.length > 0) {
      const { data: payouts } = await svc.from("payouts").select("estimated_amount").in("cycle_id", cycleIds);
      spent = (payouts ?? []).reduce((s: number, p: any) => s + Number(p.estimated_amount ?? 0), 0);
    }
    if (funded - spent <= 0) {
      throw new Error("This campaign's brand is out of funds — clips can't be accepted right now.");
    }
  }

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("platform, handle, platform_user_id")
    .eq("user_id", userId)
    .eq("verified", true);
  const verified = accounts ?? [];
  if (verified.length === 0) {
    throw new Error("Connect and verify a social account first — clips must come from a verified account.");
  }
  const byPlatform = (p: Platform) => verified.filter((a: any) => a.platform === p);

  type Prepared = { url: string; platform: Platform; handle: string; status: string };
  const prepared: Prepared[] = [];
  for (const url of clean) {
    assertValidClipUrl(url);
    const platform = detectPlatform(url)!;
    const mine = byPlatform(platform);
    if (mine.length === 0) {
      throw new Error(
        `No verified ${PLATFORM_LABELS[platform]} account. Verify one on the Accounts page before uploading ${PLATFORM_LABELS[platform]} links.`
      );
    }
    if (platform === "tiktok") {
      const handle = extractTikTokHandle(url) ?? (await resolveTikTokAuthor(url));
      if (!handle) throw new Error(`Could not read the author of this TikTok link: ${url}`);
      if (!mine.some((a: any) => norm(a.handle) === handle)) {
        throw new Error(
          `This TikTok link is from @${handle}, which is not one of your verified accounts.`
        );
      }
      prepared.push({ url, platform, handle: `@${handle}`, status: "pending_review" });
    } else if (platform === "x") {
      const handle = extractXHandle(url);
      if (!handle) throw new Error(`Could not read the author of this X link: ${url}`);
      if (!mine.some((a: any) => norm(a.handle) === handle)) {
        throw new Error(`This X link is from @${handle}, which is not one of your verified accounts.`);
      }
      prepared.push({ url, platform, handle: `@${handle}`, status: "pending_review" });
    } else if (platform === "youtube") {
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) throw new Error(`Could not parse this YouTube link: ${url}`);
      const channelId = await resolveVideoChannel(videoId);
      if (!channelId) {
        // API not configured or video unreadable — hold for review instead of guessing.
        prepared.push({ url, platform, handle: "", status: "pending_review" });
      } else if (!mine.some((a: any) => a.platform_user_id === channelId)) {
        // Manually-verified accounts have no platform_user_id — hold for admin
        // review instead of rejecting (admin verifies channel ownership manually).
        const manualAcct = mine.find((a: any) => a.platform === "youtube" && !a.platform_user_id);
        if (manualAcct) {
          prepared.push({ url, platform, handle: (manualAcct as any).handle, status: "pending_review" });
        } else {
          throw new Error("This YouTube video is not from one of your verified channels.");
        }
      } else {
        const acct = mine.find((a: any) => a.platform_user_id === channelId);
        prepared.push({ url, platform, handle: (acct as any).handle, status: "pending_review" });
      }
    } else {
      // Instagram: the reel URL carries no author info and resolving it needs a
      // Meta app token — hold for manual review rather than guessing.
      prepared.push({ url, platform, handle: "", status: "pending_review" });
    }
  }

  const rows = prepared.map((p) => ({
    user_id: userId,
    campaign_id: campaignId,
    platform: p.platform,
    post_url: p.url,
    account_handle: p.handle,
    streamer_name: "",
    tracking_status: p.status,
  }));
  const { data: inserted, error } = await supabase
    .from("clips")
    .insert(rows)
    .select("id, post_url, platform, account_handle");
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard", "layout");
  const held = prepared.filter((p) => p.status === "pending_review").length;

  // Email the admin one-click review links (fire-and-forget for the user).
  try {
    const [{ data: camp }, { data: prof }] = await Promise.all([
      supabase.from("campaigns").select("name").eq("id", campaignId).single(),
      supabase.from("profiles").select("display_name").eq("id", userId).single(),
    ]);
    const { notifyClipsSubmitted } = await import("./admin-email");
    await notifyClipsSubmitted(
      ((inserted ?? []) as any[]).map((c) => ({
        id: c.id as string,
        url: c.post_url as string,
        platform: String(c.platform),
        handle: (c.account_handle as string) || "",
        campaignName: (camp as any)?.name ?? "a campaign",
        clipperName: (prof as any)?.display_name ?? "A clipper",
      }))
    );
  } catch {
    /* admin email is best-effort; the clips are already saved */
  }

  return { inserted: rows.length, heldForReview: held };
}

export async function joinCampaign(campaignId: string) {
  const { supabase, userId } = await authed();
  const { error } = await supabase
    .from("campaign_members")
    .upsert({ user_id: userId, campaign_id: campaignId }, { onConflict: "user_id,campaign_id" });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard", "layout");
}

export async function addPaymentMethod(type: PayoutMethod, identifier: string) {
  const { supabase, userId } = await authed();
  const id = identifier.trim();
  if (!id) throw new Error("Enter your payment identifier.");
  if (type === "upi" && !id.includes("@")) {
    throw new Error("Enter a valid UPI ID (e.g. name@upi).");
  }
  if (type === "paypal" && !id.includes("@")) {
    throw new Error("Enter a valid PayPal email.");
  }
  const { data: existing } = await supabase.from("payment_methods").select("id").eq("user_id", userId);
  const { error } = await supabase.from("payment_methods").insert({
    user_id: userId, type, identifier: id, is_default: !existing || existing.length === 0,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/payments");
}

export async function deletePaymentMethod(id: string) {
  const { supabase, userId } = await authed();
  const { error } = await supabase.from("payment_methods").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/payments");
}

export async function setDefaultPaymentMethod(id: string) {
  const { supabase, userId } = await authed();
  await supabase.from("payment_methods").update({ is_default: false }).eq("user_id", userId);
  const { error } = await supabase.from("payment_methods").update({ is_default: true }).eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/payments");
}

export async function connectSocialAccount(platform: Platform, handle: string) {
  const { supabase, userId } = await authed();
  const h = handle.trim().replace(/^@/, "");
  if (!h) throw new Error("Enter your handle.");
  // Never un-verify an already-verified account: re-adding it is a no-op error.
  const { data: existing } = await supabase
    .from("social_accounts")
    .select("id, verified")
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("handle", `@${h}`)
    .maybeSingle();
  if ((existing as any)?.verified) {
    throw new Error("This account is already connected and verified.");
  }
  const code = makeVerificationCode();
  const { data: acct, error } = await supabase.from("social_accounts").upsert(
    {
      user_id: userId,
      platform,
      handle: `@${h}`,
      verified: false,
      verification_code: code,
      // (Re)starts the 3-minute gate for the automated bio check.
      verification_requested_at: new Date().toISOString(),
    },
    { onConflict: "user_id,platform,handle" }
  ).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/accounts");

  // Email the admin one-click verify/reject links (best-effort).
  try {
    const { data: prof } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", userId)
      .single();
    const { notifyAccountVerification } = await import("./admin-email");
    await notifyAccountVerification({
      id: (acct as any)?.id as string,
      platform: String(platform),
      handle: `@${h}`,
      code,
      clipperName: (prof as any)?.display_name ?? "A clipper",
    });
  } catch {
    /* admin email is best-effort; the account is already saved */
  }

  return { verificationCode: code };
}

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: string; manual?: boolean; waiting?: boolean; waitSeconds?: number };

/**
 * Verify a social account with the bio-code bot.
 * YouTube is checked live via the YouTube Data API (bio must contain the code,
 * channel needs >= MIN_FOLLOWERS subscribers). Instagram is checked via an
 * Apify bio scrape once the code has been issued for 3+ minutes (same bar:
 * code in bio + >= MIN_FOLLOWERS followers). TikTok / X have no automated
 * bio source, so those stay pending for manual review.
 */
export async function verifySocialAccount(id: string): Promise<VerifyResult> {
  const { supabase, userId } = await authed();
  const { data: acct } = await supabase
    .from("social_accounts")
    .select("id, platform, handle, verification_code, verified, verification_requested_at")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (!acct) return { ok: false, reason: "Account not found." };
  if (acct.verified) return { ok: true };

  if (acct.platform === "instagram") {
    return verifyInstagramAccount(supabase, userId, id, acct as any);
  }

  if (acct.platform !== "youtube") {
    return {
      ok: false,
      manual: true,
      reason:
        "Automated bio checks are only available for YouTube and Instagram right now — TikTok and X don't offer a way to read bios automatically. Add the code to your bio; accounts on these platforms are verified by manual review.",
    };
  }

  const result = await verifyYouTubeAccount(acct.handle, acct.verification_code);
  if (!result.ok) return { ok: false, reason: result.reason };

  const { error } = await supabase
    .from("social_accounts")
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
      follower_count: result.channel.subscribers,
      platform_user_id: result.channel.channelId,
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/dashboard/accounts");
  return { ok: true };
}

/**
 * Instagram bio-code verification via Apify.
 * The check only runs once the code has been issued for BIO_CHECK_WAIT_MS —
 * the clipper needs time to actually add it to their bio, and the gate
 * bounds Apify spend on instant re-clicks.
 */
async function verifyInstagramAccount(
  supabase: any,
  userId: string,
  id: string,
  acct: { handle: string; verification_code: string; verification_requested_at: string | null }
): Promise<VerifyResult> {
  const requestedAt = acct.verification_requested_at
    ? new Date(acct.verification_requested_at).getTime()
    : 0;
  const elapsed = Date.now() - requestedAt;
  if (elapsed < BIO_CHECK_WAIT_MS) {
    const waitSeconds = Math.ceil((BIO_CHECK_WAIT_MS - elapsed) / 1000);
    return {
      ok: false,
      waiting: true,
      waitSeconds,
      reason: `The automatic bio check unlocks in about ${Math.max(1, Math.ceil(waitSeconds / 60))} minute(s). Make sure ${acct.verification_code} is in your Instagram bio.`,
    };
  }

  const { fetchInstagramProfile } = await import("./apify");
  const profile = await fetchInstagramProfile(acct.handle);
  if (!profile || profile.bio === null) {
    return {
      ok: false,
      reason:
        "Couldn't read the Instagram bio right now. Keep the code in your bio and try again in a minute — if it keeps failing, the account will be picked up by manual review.",
    };
  }
  if (!profile.bio.toLowerCase().includes(String(acct.verification_code).toLowerCase())) {
    return {
      ok: false,
      reason: `The code ${acct.verification_code} wasn't found in the Instagram bio for ${acct.handle}. Add it to your bio and try again.`,
    };
  }
  const followers = profile.followers ?? 0;
  if (followers < MIN_FOLLOWERS) {
    return {
      ok: false,
      reason: `This account has ${followers.toLocaleString()} followers — at least ${MIN_FOLLOWERS.toLocaleString()} are required.`,
    };
  }

  const { error } = await supabase
    .from("social_accounts")
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
      follower_count: followers,
      platform_user_id: profile.username ?? acct.handle,
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) return { ok: false, reason: error.message };
  revalidatePath("/dashboard/accounts");
  return { ok: true };
}

export async function removeSocialAccount(id: string) {
  const { supabase, userId } = await authed();
  const { error } = await supabase.from("social_accounts").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/accounts");
}

export async function updateProfile(input: { displayName: string; bio: string; publicProfile: boolean }) {
  const { supabase, userId } = await authed();
  const { error } = await supabase.from("profiles").update({
    display_name: input.displayName.trim() || "Clipper",
    bio: input.bio.trim() || null,
    public_profile: input.publicProfile,
  }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard", "layout");
}

export async function createTeam(name: string) {
  const { supabase, userId } = await authed();
  const n = name.trim();
  if (!n) throw new Error("Enter a team name.");
  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  const { error } = await supabase.from("teams").insert({
    owner_id: userId, name: n, referral_code: code,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/teams");
  return { referralCode: code };
}

export async function deleteClip(id: string) {
  const { supabase, userId } = await authed();
  // Only clips that never earned anything can be deleted: awaiting review or
  // rejected. Deleting a tracking/tracked clip would orphan payout data.
  const { data: clip } = await supabase
    .from("clips")
    .select("id, tracking_status")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (!clip) throw new Error("Clip not found.");
  const status = (clip as any).tracking_status;
  if (status !== "pending_review" && status !== "not_tracking") {
    throw new Error("Only clips awaiting review or rejected can be deleted.");
  }
  const { error } = await supabase.from("clips").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard", "layout");
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Permanently delete the caller's account and all associated data.
 * Uses the service role (admin) client — the profiles table has
 * ON DELETE CASCADE from auth.users, so profile/brands/campaigns/clips
 * rows are removed automatically.
 */
export async function deleteAccountAction() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { createServiceClient } = await import("./supabase/service");
  const svc = createServiceClient();
  if (!svc) throw new Error("Account deletion is temporarily unavailable.");

  const { error } = await svc.auth.admin.deleteUser(user.id);
  if (error) throw new Error(error.message);

  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Phone-callback request from the /brands page (public, no auth).
 * Indian 10-digit mobile validation; stored for sales follow-up.
 */
export async function requestCallback(input: {
  name: string;
  phone: string;
  company?: string;
  message?: string;
}) {
  const name = (input.name ?? "").trim();
  const digits = (input.phone ?? "").replace(/\D/g, "");
  // Accept 10 digits, or 12 starting with 91 (country code).
  const normalized = digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits;
  if (!name) throw new Error("Please enter your name.");
  if (!/^[6-9]\d{9}$/.test(normalized)) {
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  }
  const supabase = createClient();
  const { error } = await supabase.from("callback_requests").insert({
    name,
    phone: normalized,
    company: (input.company ?? "").trim() || null,
    message: (input.message ?? "").trim() || null,
    status: "new",
  });
  if (error) throw new Error("Could not submit your request. Please try again.");
}
