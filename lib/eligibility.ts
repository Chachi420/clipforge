"use server";

import { requireBrand } from "./brand-actions";
import { createClient } from "./supabase/server";
import { revalidatePath } from "next/cache";
import type { CampaignInvite, RateTier, EligibilityType } from "./types";

/** Rate tiers for a brand-owned campaign. Exported so the edit form can preload them. */
export async function getCampaignRateTiers(campaignId: string): Promise<RateTier[]> {
  const { supabase, brandId } = await requireBrand();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("brand_id", brandId)
    .single();
  if (!campaign) return [];
  const { data, error } = await supabase
    .from("campaign_rate_tiers")
    .select("id, min_followers, multiplier")
    .eq("campaign_id", campaignId)
    .order("min_followers", { ascending: true });
  if (error) return [];
  return (data ?? []).map((r: any) => ({
    id: r.id,
    minFollowers: r.min_followers,
    multiplier: Number(r.multiplier),
  }));
}

/**
 * Invite a clipper to an invite-only campaign.
 * Backend agent: flesh out with email lookup, code generation, etc.
 * UI contract: inviteClipper(campaignId, clipperId) — clipperId may be a
 * user id, username, or email; implementations should resolve it.
 */
export async function inviteClipper(
  campaignId: string,
  clipperId: string
): Promise<{ ok: boolean; message: string }> {
  const { supabase, brandId } = await requireBrand();
  const id = clipperId.trim();
  if (!id) throw new Error("Enter a clipper username or email.");

  // Verify the campaign belongs to this brand and is invite-only.
  const { data: campaign, error: campError } = await supabase
    .from("campaigns")
    .select("id, eligibility_type")
    .eq("id", campaignId)
    .eq("brand_id", brandId)
    .single();
  if (campError || !campaign) throw new Error("Campaign not found.");
  if ((campaign as any).eligibility_type !== "invite_only") {
    throw new Error("This campaign is not invite-only.");
  }

  // Resolve the clipper by email or display name.
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, email")
    .or(`email.eq.${id},display_name.eq.${id}`)
    .maybeSingle();

  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  const { error } = await supabase.from("campaign_invites").insert({
    campaign_id: campaignId,
    clipper_id: (profile as any)?.id ?? null,
    email: (profile as any)?.email ?? (id.includes("@") ? id : null),
    code,
    status: "pending",
  });
  if (error) throw new Error(error.message);

  revalidatePath("/brand", "layout");
  return {
    ok: true,
    message: (profile as any)
      ? `Invite sent to ${(profile as any).display_name}.`
      : `Invite code ${code} created.`,
  };
}

/** List invites for a brand-owned campaign. */export async function getCampaignInvites(campaignId: string): Promise<CampaignInvite[]> {
  const { supabase, brandId } = await requireBrand();
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("brand_id", brandId)
    .single();
  if (!campaign) throw new Error("Campaign not found.");

  const { data, error } = await supabase
    .from("campaign_invites")
    .select("id, campaign_id, clipper_id, email, code, status, created_at")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    campaignId: r.campaign_id,
    clipperId: r.clipper_id,
    email: r.email,
    code: r.code,
    status: r.status,
    createdAt: r.created_at,
  }));
}

/** Revoke a pending invite. */
export async function revokeInvite(inviteId: string): Promise<void> {
  const { supabase, brandId } = await requireBrand();
  // Ensure the invite belongs to a campaign owned by this brand.
  const { data: invite } = await supabase
    .from("campaign_invites")
    .select("id, campaign_id, campaigns!inner(brand_id)")
    .eq("id", inviteId)
    .single();
  if (!invite || (invite as any).campaigns?.brand_id !== brandId) {
    throw new Error("Invite not found.");
  }
  const { error } = await supabase
    .from("campaign_invites")
    .update({ status: "expired" })
    .eq("id", inviteId);
  if (error) throw new Error(error.message);
  revalidatePath("/brand", "layout");
}

/* ------------------------------------------------------------------ */
/* Clipper-side eligibility: check + join                               */
/* ------------------------------------------------------------------ */

/** Result of an eligibility check for joining a campaign. */
export interface EligibilityCheck {
  eligible: boolean;
  /** Human-readable reason when not eligible. */
  reason?: string;
  /** Quantified gap, for "what's missing" UI. */
  missing?: { need: number; have: number; metric: string };
}

/**
 * Check whether a clipper meets a campaign's join requirements.
 * Pure read — safe to call from server components for pre-render gating.
 */
export async function checkEligibility(
  campaignId: string,
  userId: string
): Promise<EligibilityCheck> {
  const supabase = createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, eligibility_type, min_followers, min_avg_views")
    .eq("id", campaignId)
    .single();
  if (!campaign) return { eligible: false, reason: "Campaign not found." };

  const type = ((campaign as any).eligibility_type ?? "open") as EligibilityType;

  if (type === "open") return { eligible: true };

  if (type === "invite_only") {
    const { data: invite } = await supabase
      .from("campaign_invites")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("clipper_id", userId)
      .in("status", ["pending", "accepted"])
      .maybeSingle();
    if (invite) return { eligible: true };
    return { eligible: false, reason: "This campaign is invite-only. Ask the brand for an invite." };
  }

  // Verified accounts are the source of truth for follower counts.
  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("follower_count")
    .eq("user_id", userId)
    .eq("verified", true);
  const bestFollowers = Math.max(
    0,
    ...((accounts ?? []).map((a: any) => Number(a.follower_count ?? 0)))
  );

  if (type === "followers") {
    const need = Number((campaign as any).min_followers ?? 0);
    if (bestFollowers >= need) return { eligible: true };
    return {
      eligible: false,
      reason: `This campaign requires ${need.toLocaleString()}+ followers on a verified account.`,
      missing: { need, have: bestFollowers, metric: "followers" },
    };
  }

  if (type === "engagement") {
    const need = Number((campaign as any).min_avg_views ?? 0);
    // Average of latest view snapshots across the clipper's clips.
    const { data: clips } = await supabase
      .from("clips")
      .select("id")
      .eq("user_id", userId);
    const clipIds = (clips ?? []).map((c: any) => c.id);
    let avgViews = 0;
    if (clipIds.length > 0) {
      const { data: snaps } = await supabase
        .from("clip_metric_snapshots")
        .select("clip_id, views, scanned_at")
        .in("clip_id", clipIds)
        .order("scanned_at", { ascending: false });
      const latest: Record<string, number> = {};
      for (const s of (snaps ?? []) as any[]) {
        if (latest[s.clip_id] == null) latest[s.clip_id] = Number(s.views ?? 0);
      }
      const vals = Object.values(latest);
      avgViews = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    }
    if (avgViews >= need) return { eligible: true };
    return {
      eligible: false,
      reason: `This campaign requires ${need.toLocaleString()}+ average views per clip.`,
      missing: { need, have: avgViews, metric: "avg views" },
    };
  }

  return { eligible: true };
}

/**
 * Join a campaign. Enforces eligibility — throws a human-readable error
 * when the clipper doesn't qualify. Safe to call repeatedly (upsert).
 */
export async function joinCampaign(campaignId: string): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to join this campaign.");

  const check = await checkEligibility(campaignId, user.id);
  if (!check.eligible) {
    throw new Error(check.reason ?? "You don't meet this campaign's requirements.");
  }

  const { error } = await supabase
    .from("campaign_members")
    .upsert({ user_id: user.id, campaign_id: campaignId }, { onConflict: "user_id,campaign_id" });
  if (error) throw new Error(error.message);

  // Consume a pending invite if this was an invite-only join.
  await supabase
    .from("campaign_invites")
    .update({ status: "accepted" })
    .eq("campaign_id", campaignId)
    .eq("clipper_id", user.id)
    .eq("status", "pending");

  revalidatePath("/dashboard", "layout");
}

/**
 * Effective rate multiplier for a clipper on a campaign, based on their
 * best verified follower count vs the brand's rate tiers.
 * Returns 1.0 when no tiers are configured.
 */
export async function getRateMultiplier(
  campaignId: string,
  userId: string
): Promise<number> {
  const supabase = createClient();
  const { data: tiers } = await supabase
    .from("campaign_rate_tiers")
    .select("min_followers, multiplier")
    .eq("campaign_id", campaignId)
    .order("min_followers", { ascending: false });
  if (!tiers || tiers.length === 0) return 1.0;

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("follower_count")
    .eq("user_id", userId)
    .eq("verified", true);
  const best = Math.max(
    0,
    ...((accounts ?? []).map((a: any) => Number(a.follower_count ?? 0)))
  );
  if (best === 0) return 1.0;

  for (const t of tiers) {
    if (best >= Number((t as any).min_followers)) return Number((t as any).multiplier);
  }
  return 1.0;
}



/* ------------------------------------------------------------------ */
