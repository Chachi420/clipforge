"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "./auth";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** Throws unless the caller is signed in with an email in ADMIN_EMAILS. */
async function requireAdmin() {
  const user = await getSessionUser();
  const email = (user?.email || "").toLowerCase();
  if (!user || !adminEmails().includes(email)) {
    throw new Error("Not authorized");
  }
  return user;
}

/**
 * Service-role client: bypasses RLS so admins can read/write rows belonging
 * to other users. Requires SUPABASE_SERVICE_ROLE_KEY.
 */
function adminDb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Admin panel is not configured: set SUPABASE_SERVICE_ROLE_KEY.");
  }
  return createClient(url, key);
}

export interface PendingVerification {
  id: string;
  platform: string;
  handle: string;
  verificationCode: string;
  followerCount: number;
  connectedAt: string;
  userEmail: string;
  displayName: string;
}

export async function getPendingVerifications(): Promise<PendingVerification[]> {
  await requireAdmin();
  const db = adminDb();
  const { data, error } = await db
    .from("social_accounts")
    .select(
      "id, platform, handle, verification_code, follower_count, connected_at, profiles!inner(email, display_name)"
    )
    .eq("verified", false)
    .order("connected_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    platform: r.platform,
    handle: r.handle,
    verificationCode: r.verification_code ?? "",
    followerCount: r.follower_count ?? 0,
    connectedAt: (r.connected_at ?? "").slice(0, 10),
    userEmail: r.profiles?.email ?? "",
    displayName: r.profiles?.display_name ?? "",
  }));
}

/** Approve a pending account: marks it verified with the given follower count. */
export async function approveAccount(id: string, followerCount: number) {
  await requireAdmin();
  const db = adminDb();
  const { error } = await db
    .from("social_accounts")
    .update({
      verified: true,
      verified_at: new Date().toISOString(),
      follower_count: Math.max(0, Math.floor(Number(followerCount) || 0)),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/verifications");
}

/** Reject a pending account: removes it (user can re-add). */
export async function rejectAccount(id: string) {
  await requireAdmin();
  const db = adminDb();
  const { error } = await db.from("social_accounts").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/verifications");
}

export interface PendingPayout {
  id: string;
  userEmail: string;
  displayName: string;
  campaignName: string;
  cycleNumber: number;
  period: string;
  amount: number;
  method: string | null;
  totalViews: number;
  totalClips: number;
}

export async function getPendingPayouts(): Promise<PendingPayout[]> {
  await requireAdmin();
  const db = adminDb();
  const { data, error } = await db
    .from("payouts")
    .select(
      "id, estimated_amount, method, total_views, total_clips, profiles!inner(email, display_name), payout_cycles!inner(cycle_number, period_start, period_end, campaigns!inner(name))"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => {
    const c = r.payout_cycles;
    return {
      id: r.id,
      userEmail: r.profiles?.email ?? "",
      displayName: r.profiles?.display_name ?? "",
      campaignName: c?.campaigns?.name ?? "",
      cycleNumber: c?.cycle_number ?? 0,
      period: `${c?.period_start ?? ""} → ${c?.period_end ?? ""}`,
      amount: Number(r.estimated_amount ?? 0),
      method: r.method ?? null,
      totalViews: r.total_views ?? 0,
      totalClips: r.total_clips ?? 0,
    };
  });
}

/** Mark a payout as paid: status='paid', final_amount=estimated_amount. */
export async function markPayoutPaid(id: string) {
  await requireAdmin();
  const db = adminDb();
  const { data: row, error: readError } = await db
    .from("payouts")
    .select("estimated_amount")
    .eq("id", id)
    .single();
  if (readError) throw new Error(readError.message);
  const { error } = await db
    .from("payouts")
    .update({ status: "paid", final_amount: Number(row?.estimated_amount ?? 0) })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/payouts");
}

export interface PendingCampaign {
  id: string;
  slug: string;
  name: string;
  type: string;
  category: string;
  ratePer100k: number;
  budgetCap: number | null;
  platforms: string[];
  brandName: string;
  brandEmail: string;
  createdAt: string;
}

/** Campaigns awaiting approval (status='pending'), with their brand. */
export async function getPendingCampaigns(): Promise<PendingCampaign[]> {
  await requireAdmin();
  const db = adminDb();
  const { data, error } = await db
    .from("campaigns")
    .select(
      "id, slug, name, type, category, rate_per_100k, budget_cap, platforms, created_at, brands!inner(name, contact_email)"
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    type: r.type,
    category: r.category,
    ratePer100k: Number(r.rate_per_100k ?? 0),
    budgetCap: r.budget_cap != null ? Number(r.budget_cap) : null,
    platforms: r.platforms ?? [],
    brandName: r.brands?.name ?? "—",
    brandEmail: r.brands?.contact_email ?? "",
    createdAt: (r.created_at ?? "").slice(0, 10),
  }));
}

/** Approve a pending campaign brief → status='active'. */
export async function approveCampaign(id: string) {
  await requireAdmin();
  const db = adminDb();
  const { error } = await db
    .from("campaigns")
    .update({ status: "active" })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/brand", "layout");
}

/** Reject a pending campaign brief. Rejection deletes the brief so the brand
 *  can submit a corrected one; the reason is surfaced via notification. */
export async function rejectCampaign(id: string, reason: string) {
  await requireAdmin();
  const db = adminDb();
  const { data: row } = await db
    .from("campaigns")
    .select("id, brand_id, name")
    .eq("id", id)
    .eq("status", "pending")
    .single();
  if (!row) throw new Error("Pending campaign not found.");
  const { error } = await db.from("campaigns").delete().eq("id", id);
  if (error) throw new Error(error.message);
  // Notify the brand owner.
  const { data: brand } = await db
    .from("brands")
    .select("owner_id")
    .eq("id", (row as any).brand_id)
    .single();
  if ((brand as any)?.owner_id) {
    await db.from("notifications").insert({
      user_id: (brand as any).owner_id,
      type: "campaign_rejected",
      title: `Campaign brief not approved: ${(row as any).name}`,
      body: reason.trim() || "Please revise the brief and resubmit.",
    });
  }
  revalidatePath("/admin");
  revalidatePath("/brand", "layout");
}

export interface BrandTopupRow {
  id: string;
  brandId: string;
  brandName: string;
  amount: number;
  method: string | null;
  reference: string | null;
  createdAt: string;
}

/** Record a manual top-up for a brand (v1: admin records after receiving funds). */
export async function recordTopup(input: {
  brandId: string;
  amount: number;
  method?: string;
  reference?: string;
}) {
  const user = await requireAdmin();
  const amount = Number(input.amount);
  if (!(amount > 0)) throw new Error("Amount must be positive.");
  const db = adminDb();
  const { data: brand } = await db.from("brands").select("id").eq("id", input.brandId).single();
  if (!brand) throw new Error("Brand not found.");
  const { error } = await db.from("brand_topups").insert({
    brand_id: input.brandId,
    amount,
    method: input.method?.trim() || null,
    reference: input.reference?.trim() || null,
    recorded_by: user.id,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath("/brand", "layout");
}

/** Recent top-ups across brands (admin view). */
export async function getRecentTopups(limit = 50): Promise<BrandTopupRow[]> {
  await requireAdmin();
  const db = adminDb();
  const { data, error } = await db
    .from("brand_topups")
    .select("id, brand_id, amount, method, reference, created_at, brands!inner(name)")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    brandId: r.brand_id,
    brandName: r.brands?.name ?? "—",
    amount: Number(r.amount ?? 0),
    method: r.method ?? null,
    reference: r.reference ?? null,
    createdAt: (r.created_at ?? "").slice(0, 16).replace("T", " "),
  }));
}

/** All brands (for admin selectors). */
export async function getAllBrands(): Promise<{ id: string; name: string }[]> {
  await requireAdmin();
  const db = adminDb();
  const { data, error } = await db.from("brands").select("id, name").order("name");
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({ id: r.id, name: r.name }));
}

export interface AdminOverview {
  pendingVerifications: number;
  pendingPayouts: number;
  pendingPayoutAmount: number;
  campaigns: number;
  users: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin();
  const db = adminDb();
  const [verifs, payouts, campaigns, users] = await Promise.all([
    db.from("social_accounts").select("id", { count: "exact", head: true }).eq("verified", false),
    db.from("payouts").select("estimated_amount").eq("status", "pending"),
    db.from("campaigns").select("id", { count: "exact", head: true }),
    db.from("profiles").select("id", { count: "exact", head: true }),
  ]);
  if (verifs.error) throw new Error(verifs.error.message);
  if (payouts.error) throw new Error(payouts.error.message);
  if (campaigns.error) throw new Error(campaigns.error.message);
  if (users.error) throw new Error(users.error.message);
  return {
    pendingVerifications: verifs.count ?? 0,
    pendingPayouts: (payouts.data ?? []).length,
    pendingPayoutAmount: (payouts.data ?? []).reduce(
      (s: number, r: any) => s + Number(r.estimated_amount ?? 0),
      0
    ),
    campaigns: campaigns.count ?? 0,
    users: users.count ?? 0,
  };
}
