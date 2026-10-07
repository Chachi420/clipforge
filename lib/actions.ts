"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Platform, PayoutMethod } from "./types";

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

/** Submit clip URLs to a campaign. Returns { inserted } or throws. */
export async function uploadClips(campaignId: string, urls: string[]) {
  const { supabase, userId } = await authed();
  const clean = Array.from(new Set(urls.map((u) => u.trim()).filter(Boolean))).slice(0, 25);
  if (clean.length === 0) throw new Error("No URLs provided.");
  const rows = clean.map((url) => ({
    user_id: userId,
    campaign_id: campaignId,
    platform: detectPlatform(url),
    post_url: url,
    account_handle: "",
    streamer_name: "",
    tracking_status: "tracking",
  }));
  const { error } = await supabase.from("clips").insert(rows);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard", "layout");
  return { inserted: rows.length };
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
  const { error } = await supabase.from("social_accounts").upsert(
    { user_id: userId, platform, handle: `@${h}`, verified: false },
    { onConflict: "user_id,platform,handle" }
  );
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/accounts");
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
