"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { getBrand, getUserRole } from "./brand-db";
import type { Platform } from "./types";

/**
 * Throws/redirects unless the caller is a signed-in user with
 * profiles.role='brand' AND a brands row. Auto-creates the brands row on
 * first access so a newly-provisioned brand account just works.
 * Every brand server action MUST go through this — never trust client input.
 */
export async function requireBrand() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Demo mode: connect Supabase to enable brand actions.");
  }
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/brand/login");

  const role = await getUserRole(user.id);
  if (role !== "brand") redirect("/dashboard");

  let brand = await getBrand(user.id);
  if (!brand) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", user.id)
      .single();
    const name =
      (profile as any)?.display_name || (user.email ?? "Brand").split("@")[0];
    const { data, error } = await supabase
      .from("brands")
      .insert({
        owner_id: user.id,
        name,
        contact_email: user.email ?? (profile as any)?.email ?? "",
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    brand = {
      id: data.id,
      ownerId: data.owner_id,
      name: data.name,
      logoUrl: data.logo_url ?? "",
      contactEmail: data.contact_email ?? "",
      createdAt: (data.created_at ?? "").slice(0, 10),
    };
  }
  return { supabase, userId: user.id, brandId: brand.id, brand };
}

/** Verify a campaign belongs to the caller's brand; returns its id. */
async function ownCampaign(supabase: any, brandId: string, campaignId: string) {
  const { data, error } = await supabase
    .from("campaigns")
    .select("id")
    .eq("id", campaignId)
    .eq("brand_id", brandId)
    .single();
  if (error || !data) throw new Error("Campaign not found.");
  return data.id as string;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "campaign"
  );
}

export interface CampaignBriefInput {
  name: string;
  category: string;
  type: "per_view" | "bounty" | "pot";
  platforms: Platform[];
  ratePer100k: number;
  platformRates?: Partial<Record<Platform, number>>;
  budgetCap?: number | null;
  durationMode: "deadline" | "budget";
  daysLeft: number;
  minViewsPerPost: number;
  minViewsTotal: number;
  payoutMethod: "paypal" | "usdt_eth" | "usdc_eth";
  rules: string;
  bountyPot?: number | null;
}

/** Sales-led brief: creates the campaign as status='pending' for admin review. */
export async function createCampaignBrief(input: CampaignBriefInput) {
  const { supabase, brandId } = await requireBrand();
  const name = input.name.trim();
  if (name.length < 3) throw new Error("Give the campaign a name (3+ characters).");
  if (!(input.ratePer100k > 0)) throw new Error("Set a rate per 100k views.");
  if (input.platforms.length === 0) throw new Error("Pick at least one platform.");

  const base = slugify(name);
  let slug = base;
  for (let i = 2; i < 100; i++) {
    const { data } = await supabase.from("campaigns").select("id").eq("slug", slug).maybeSingle();
    if (!data) break;
    slug = `${base}-${i}`;
  }

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      slug,
      name,
      brand_id: brandId,
      status: "pending",
      type: input.type,
      category: input.category || "Other",
      platforms: input.platforms,
      payout_method: input.payoutMethod,
      rate_per_100k: input.ratePer100k,
      platform_rates: input.platformRates ?? null,
      budget_cap: input.budgetCap ?? null,
      duration_mode: input.durationMode,
      payout_mode: input.type === "pot" ? "pot" : "payrate",
      days_left: Math.max(1, Math.min(365, Math.floor(input.daysLeft) || 30)),
      min_views_per_post: Math.max(0, Math.floor(input.minViewsPerPost) || 0),
      min_views_total: Math.max(0, Math.floor(input.minViewsTotal) || 0),
      bounty_pot: input.bountyPot ?? null,
      rules: input.rules ?? "",
    })
    .select("slug")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/brand/campaigns");
  revalidatePath("/admin");
  return { slug: (data as any).slug as string };
}

export interface CampaignSettingsPatch {
  name?: string;
  ratePer100k?: number;
  budgetCap?: number | null;
  minViewsPerPost?: number;
  minViewsTotal?: number;
  platforms?: Platform[];
  rules?: string;
  category?: string;
  daysLeft?: number;
}

/** Brand edits settings on their own campaign (pending or live). */
export async function updateCampaignSettings(campaignId: string, patch: CampaignSettingsPatch) {
  const { supabase, brandId } = await requireBrand();
  const id = await ownCampaign(supabase, brandId, campaignId);
  const update: Record<string, any> = {};
  if (patch.name !== undefined) {
    const n = patch.name.trim();
    if (n.length < 3) throw new Error("Name must be 3+ characters.");
    update.name = n;
  }
  if (patch.ratePer100k !== undefined) {
    if (!(patch.ratePer100k > 0)) throw new Error("Rate must be positive.");
    update.rate_per_100k = patch.ratePer100k;
  }
  if (patch.budgetCap !== undefined) update.budget_cap = patch.budgetCap;
  if (patch.minViewsPerPost !== undefined)
    update.min_views_per_post = Math.max(0, Math.floor(patch.minViewsPerPost));
  if (patch.minViewsTotal !== undefined)
    update.min_views_total = Math.max(0, Math.floor(patch.minViewsTotal));
  if (patch.platforms !== undefined) {
    if (patch.platforms.length === 0) throw new Error("Pick at least one platform.");
    update.platforms = patch.platforms;
  }
  if (patch.rules !== undefined) update.rules = patch.rules;
  if (patch.category !== undefined) update.category = patch.category || "Other";
  if (patch.daysLeft !== undefined)
    update.days_left = Math.max(1, Math.min(365, Math.floor(patch.daysLeft)));
  if (Object.keys(update).length === 0) return;
  const { error } = await supabase.from("campaigns").update(update).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/brand", "layout");
}

export async function pauseCampaign(campaignId: string) {
  const { supabase, brandId } = await requireBrand();
  const id = await ownCampaign(supabase, brandId, campaignId);
  const { error } = await supabase
    .from("campaigns")
    .update({ status: "paused" })
    .eq("id", id)
    .eq("status", "active");
  if (error) throw new Error(error.message);
  revalidatePath("/brand", "layout");
}

export async function resumeCampaign(campaignId: string) {
  const { supabase, brandId } = await requireBrand();
  const id = await ownCampaign(supabase, brandId, campaignId);
  const { error } = await supabase
    .from("campaigns")
    .update({ status: "active" })
    .eq("id", id)
    .eq("status", "paused");
  if (error) throw new Error(error.message);
  revalidatePath("/brand", "layout");
}

// ---------- bounties ----------

async function ownBounty(supabase: any, brandId: string, bountyId: string) {
  const { data, error } = await supabase
    .from("bounties")
    .select("id, campaigns!inner(brand_id)")
    .eq("id", bountyId)
    .single();
  if (error || !data || (data as any).campaigns?.brand_id !== brandId) {
    throw new Error("Bounty not found.");
  }
  return bountyId;
}

export async function createBounty(
  campaignId: string,
  input: { name: string; ratePer100k: number; requirements?: string; budgetCap?: number | null }
) {
  const { supabase, brandId } = await requireBrand();
  const id = await ownCampaign(supabase, brandId, campaignId);
  const name = input.name.trim();
  if (name.length < 3) throw new Error("Name the bounty (3+ characters).");
  if (!(input.ratePer100k > 0)) throw new Error("Set a rate per 100k views.");
  const { error } = await supabase.from("bounties").insert({
    campaign_id: id,
    name,
    rate_per_100k: input.ratePer100k,
    requirements: input.requirements?.trim() || null,
    budget_cap: input.budgetCap ?? null,
    is_active: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/brand", "layout");
}

export async function toggleBounty(bountyId: string, isActive: boolean) {
  const { supabase, brandId } = await requireBrand();
  const id = await ownBounty(supabase, brandId, bountyId);
  const { error } = await supabase.from("bounties").update({ is_active: isActive }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/brand", "layout");
}

export async function deleteBounty(bountyId: string) {
  const { supabase, brandId } = await requireBrand();
  const id = await ownBounty(supabase, brandId, bountyId);
  const { error } = await supabase.from("bounties").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/brand", "layout");
}

// ---------- brand profile ----------

export async function updateBrandProfile(input: {
  name: string;
  logoUrl?: string;
  contactEmail?: string;
}) {
  const { supabase, brandId } = await requireBrand();
  const name = input.name.trim();
  if (name.length < 2) throw new Error("Brand name must be 2+ characters.");
  const { error } = await supabase
    .from("brands")
    .update({
      name,
      logo_url: input.logoUrl?.trim() || null,
      contact_email: input.contactEmail?.trim() || null,
    })
    .eq("id", brandId);
  if (error) throw new Error(error.message);
  revalidatePath("/brand", "layout");
}

export interface BrandRequestInput {
  companyName: string;
  contactName: string;
  email: string;
  website?: string;
  budgetRange: string;
  message?: string;
}

const BUDGET_RANGES = ["under_1k", "1k_5k", "5k_25k", "25k_plus"];

/** Signed-in user requests brand access. One request per user (upsert). */
export async function requestBrandAccess(input: BrandRequestInput) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/brand/login");

  const companyName = input.companyName.trim();
  const contactName = input.contactName.trim();
  const email = input.email.trim().toLowerCase();
  if (companyName.length < 2) throw new Error("Company name must be 2+ characters.");
  if (contactName.length < 2) throw new Error("Contact name must be 2+ characters.");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid work email.");
  if (!BUDGET_RANGES.includes(input.budgetRange)) throw new Error("Pick a budget range.");

  const { error } = await supabase.from("brand_requests").upsert(
    {
      user_id: user.id,
      company_name: companyName,
      contact_name: contactName,
      email,
      website: input.website?.trim() || null,
      budget_range: input.budgetRange,
      message: input.message?.trim() || null,
      status: "pending",
      reviewed_at: null,
    },
    { onConflict: "user_id" }
  );
  if (error) throw new Error(error.message);
}

/** Current user's brand request, if any. */
export async function getMyBrandRequest() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("brand_requests")
    .select("status, company_name, created_at")
    .eq("user_id", user.id)
    .maybeSingle();
  return data as { status: string; company_name: string; created_at: string } | null;
}
