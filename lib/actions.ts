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

function detectPlatform(url: string): Platform {
  const h = url.toLowerCase();
  if (h.includes("tiktok.com")) return "tiktok";
  if (h.includes("instagram.com")) return "instagram";
  if (h.includes("youtu")) return "youtube";
  return "x";
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
 *  user's verified accounts for that platform. Returns { inserted } or throws. */
export async function uploadClips(campaignId: string, urls: string[]) {
  const { supabase, userId } = await authed();
  const clean = Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean))).slice(0, 25);
  if (clean.length === 0) throw new Error("No URLs provided.");

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
    const platform = detectPlatform(url);
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
      prepared.push({ url, platform, handle: `@${handle}`, status: "tracking" });
    } else if (platform === "x") {
      const handle = extractXHandle(url);
      if (!handle) throw new Error(`Could not read the author of this X link: ${url}`);
      if (!mine.some((a: any) => norm(a.handle) === handle)) {
        throw new Error(`This X link is from @${handle}, which is not one of your verified accounts.`);
      }
      prepared.push({ url, platform, handle: `@${handle}`, status: "tracking" });
    } else if (platform === "youtube") {
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) throw new Error(`Could not parse this YouTube link: ${url}`);
      const channelId = await resolveVideoChannel(videoId);
      if (!channelId) {
        // API not configured or video unreadable — hold for review instead of guessing.
        prepared.push({ url, platform, handle: "", status: "pending_review" });
      } else if (!mine.some((a: any) => a.platform_user_id === channelId)) {
        throw new Error("This YouTube video is not from one of your verified channels.");
      } else {
        const acct = mine.find((a: any) => a.platform_user_id === channelId);
        prepared.push({ url, platform, handle: (acct as any).handle, status: "tracking" });
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
  const { error } = await supabase.from("clips").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard", "layout");
  const held = prepared.filter((p) => p.status === "pending_review").length;
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
  const code = makeVerificationCode();
  const { error } = await supabase.from("social_accounts").upsert(
    { user_id: userId, platform, handle: `@${h}`, verified: false, verification_code: code },
    { onConflict: "user_id,platform,handle" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/accounts");
  return { verificationCode: code };
}

export type VerifyResult = { ok: true } | { ok: false; reason: string; manual?: boolean };

/**
 * Verify a social account with the bio-code bot.
 * YouTube is checked live via the YouTube Data API (bio must contain the code,
 * channel needs >= MIN_FOLLOWERS subscribers). TikTok / Instagram / X have no
 * free official API for reading bios, so those stay pending for manual review.
 */
export async function verifySocialAccount(id: string): Promise<VerifyResult> {
  const { supabase, userId } = await authed();
  const { data: acct } = await supabase
    .from("social_accounts")
    .select("id, platform, handle, verification_code, verified")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  if (!acct) return { ok: false, reason: "Account not found." };
  if (acct.verified) return { ok: true };

  if (acct.platform !== "youtube") {
    return {
      ok: false,
      manual: true,
      reason:
        "Automated bio checks are only available for YouTube right now — TikTok, Instagram and X don't offer a free API to read bios. Add the code to your bio; accounts on these platforms are verified by manual review.",
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
  const { error } = await supabase.from("clips").delete().eq("id", id).eq("user_id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard", "layout");
}

export async function signOutAction() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export { MIN_FOLLOWERS };
