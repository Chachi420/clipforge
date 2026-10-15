"use server";

import { adminDb } from "./admin-db";
import { revalidatePath } from "next/cache";
import { getSessionUser } from "./auth";
import { isAdminUser } from "./admin";

/** Throws unless the caller is the admin: signed in with the single
 *  authorized Google account (see lib/admin.ts). No role-based backdoor. */
async function requireAdmin() {
  const user = await getSessionUser();
  if (!user || !isAdminUser(user)) throw new Error("Not authorized");
  return user;
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

/** Mark a payout as paid: status='paid', final_amount=estimated_amount. Notifies the clipper. */
export async function markPayoutPaid(id: string) {
  await requireAdmin();
  const db = adminDb();
  const { data: row, error: readError } = await db
    .from("payouts")
    .select("estimated_amount, user_id")
    .eq("id", id)
    .single();
  if (readError) throw new Error(readError.message);
  const { error } = await db
    .from("payouts")
    .update({ status: "paid", final_amount: Number(row?.estimated_amount ?? 0) })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if ((row as any)?.user_id) {
    await notifyUser(
      (row as any).user_id,
      "payout_settled",
      "Payout settled!",
      `Your payout of $${Number(row?.estimated_amount ?? 0).toFixed(2)} has been marked as paid.`
    );
  }
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

/** Brand wallet balance with the service-role client (bypasses RLS):
 *  funded = sum(brand_topups.amount); spent = sum(payouts.estimated_amount)
 *  across the brand's payout cycles. */
async function getBrandBalance(
  db: ReturnType<typeof adminDb>,
  brandId: string
): Promise<{ funded: number; spent: number; balance: number }> {
  const { data: topups } = await db.from("brand_topups").select("amount").eq("brand_id", brandId);
  const funded = (topups ?? []).reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0);
  const { data: cycles } = await db
    .from("payout_cycles")
    .select("id, campaigns!inner(brand_id)")
    .eq("campaigns.brand_id", brandId);
  const cycleIds = (cycles ?? []).map((c: any) => c.id);
  let spent = 0;
  if (cycleIds.length > 0) {
    const { data: payouts } = await db.from("payouts").select("estimated_amount").in("cycle_id", cycleIds);
    spent = (payouts ?? []).reduce((s: number, p: any) => s + Number(p.estimated_amount ?? 0), 0);
  }
  return { funded, spent, balance: funded - spent };
}

/** Approve a pending campaign brief → status='active'.
 *  Balance gate: a campaign can't go live if its brand has $0 available. */
export async function approveCampaign(id: string) {
  const user = await requireAdmin();
  const db = adminDb();
  const { data: camp } = await db
    .from("campaigns")
    .select("id, brand_id, status")
    .eq("id", id)
    .eq("status", "pending")
    .single();
  if (!camp) throw new Error("Pending campaign not found.");
  const { balance } = await getBrandBalance(db, (camp as any).brand_id);
  if (balance <= 0) {
    throw new Error("Cannot approve: brand balance is $0. Ask the brand to top up first.");
  }
  const { error } = await db
    .from("campaigns")
    .update({ status: "active", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
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
  pendingClipReviews: number;
  pendingCampaigns: number;
  liveCampaigns: number;
  clippers: number;
  brands: number;
  clips: number;
}

export async function getAdminOverview(): Promise<AdminOverview> {
  await requireAdmin();
  const db = adminDb();
  const [verifs, payouts, campaigns, users, clipReviews, pendingCamps, liveCamps, clippers, brands, clips] =
    await Promise.all([
      db.from("social_accounts").select("id", { count: "exact", head: true }).eq("verified", false),
      db.from("payouts").select("estimated_amount").eq("status", "pending"),
      db.from("campaigns").select("id", { count: "exact", head: true }),
      db.from("profiles").select("id", { count: "exact", head: true }),
      db.from("clips").select("id", { count: "exact", head: true }).eq("tracking_status", "pending_review"),
      db.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "pending"),
      db.from("campaigns").select("id", { count: "exact", head: true }).eq("status", "active"),
      db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "clipper"),
      db.from("brands").select("id", { count: "exact", head: true }),
      db.from("clips").select("id", { count: "exact", head: true }),
    ]);
  if (verifs.error) throw new Error(verifs.error.message);
  if (payouts.error) throw new Error(payouts.error.message);
  if (campaigns.error) throw new Error(campaigns.error.message);
  if (users.error) throw new Error(users.error.message);
  if (clipReviews.error) throw new Error(clipReviews.error.message);
  if (pendingCamps.error) throw new Error(pendingCamps.error.message);
  if (liveCamps.error) throw new Error(liveCamps.error.message);
  if (clippers.error) throw new Error(clippers.error.message);
  if (brands.error) throw new Error(brands.error.message);
  if (clips.error) throw new Error(clips.error.message);
  return {
    pendingVerifications: verifs.count ?? 0,
    pendingPayouts: (payouts.data ?? []).length,
    pendingPayoutAmount: (payouts.data ?? []).reduce(
      (s: number, r: any) => s + Number(r.estimated_amount ?? 0),
      0
    ),
    campaigns: campaigns.count ?? 0,
    users: users.count ?? 0,
    pendingClipReviews: clipReviews.count ?? 0,
    pendingCampaigns: pendingCamps.count ?? 0,
    liveCampaigns: liveCamps.count ?? 0,
    clippers: clippers.count ?? 0,
    brands: brands.count ?? 0,
    clips: clips.count ?? 0,
  };
}

export interface PendingBrandRequest {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  website: string | null;
  budgetRange: string;
  message: string | null;
  createdAt: string;
}

/** All pending brand access requests, oldest first. */
export async function getPendingBrandRequests(): Promise<PendingBrandRequest[]> {
  await requireAdmin();
  const db = adminDb();
  const { data, error } = await db
    .from("brand_requests")
    .select("id, company_name, contact_name, email, website, budget_range, message, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    companyName: r.company_name,
    contactName: r.contact_name,
    email: r.email,
    website: r.website,
    budgetRange: r.budget_range,
    message: r.message,
    createdAt: r.created_at,
  }));
}

/** Approve a brand request: sets profiles.role='brand' and creates the brands row. */
export async function approveBrandRequest(id: string) {
  await requireAdmin();
  const db = adminDb();
  const { data: row } = await db
    .from("brand_requests")
    .select("id, user_id, company_name, contact_name, email")
    .eq("id", id)
    .eq("status", "pending")
    .single();
  if (!row) throw new Error("Pending request not found.");

  const { error: roleErr } = await db
    .from("profiles")
    .update({ role: "brand" })
    .eq("id", (row as any).user_id);
  if (roleErr) throw new Error(roleErr.message);

  const { error: brandErr } = await db.from("brands").insert({
    owner_id: (row as any).user_id,
    name: (row as any).company_name,
    contact_email: (row as any).email,
  });
  if (brandErr) throw new Error(brandErr.message);

  const { error: reqErr } = await db
    .from("brand_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);
  if (reqErr) throw new Error(reqErr.message);

  revalidatePath("/admin");
}

export async function rejectBrandRequest(id: string) {
  await requireAdmin();
  const db = adminDb();
  const { error } = await db
    .from("brand_requests")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "pending");
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

// ─────────────────────────────────────────────────────────────
// Admin 3rd side — Clips, Clippers, Brands, Users, full Campaigns.
// Model ported from Wondeed (WondeedSupafire): every clip goes
// through admin approval, clippers can be suspended/reactivated,
// every decision notifies the affected user.
// ─────────────────────────────────────────────────────────────

export async function notifyUser(userId: string, type: string, title: string, body: string) {
  await requireAdmin();
  const db = adminDb();
  await db.from("notifications").insert({ user_id: userId, type, title, body });
}

/**
 * Unguarded notification insert for trusted server contexts with no user
 * session (e.g. the signed email-action route). Do NOT expose to client
 * bundles — import only from server code.
 */
export async function insertNotification(userId: string, type: string, title: string, body: string) {
  const db = adminDb();
  await db.from("notifications").insert({ user_id: userId, type, title, body });
}

// ── Clips ────────────────────────────────────────────────────

export interface AdminClip {
  id: string;
  postUrl: string;
  platform: string;
  handle: string;
  status: string;
  submittedAt: string;
  clipperId: string;
  clipperName: string;
  clipperEmail: string;
  campaignId: string;
  campaignName: string;
  views: number;
}

/** Latest view count per clip from snapshots (one query, grouped in JS). */
async function latestViewsByClip(clipIds: string[]): Promise<Record<string, number>> {
  if (clipIds.length === 0) return {};
  const db = adminDb();
  const { data } = await db
    .from("clip_metric_snapshots")
    .select("clip_id, views, scanned_at")
    .in("clip_id", clipIds)
    .order("scanned_at", { ascending: false });
  const out: Record<string, number> = {};
  for (const r of (data ?? []) as any[]) {
    if (out[r.clip_id] == null) out[r.clip_id] = Number(r.views ?? 0);
  }
  return out;
}

/** All clips, optionally filtered by tracking_status. Newest first. */
export async function getAdminClips(statusFilter?: string): Promise<AdminClip[]> {
  await requireAdmin();
  const db = adminDb();
  let q = db
    .from("clips")
    .select(
      "id, post_url, platform, account_handle, tracking_status, submitted_at, user_id, campaign_id, profiles!inner(display_name, email), campaigns!inner(name)"
    )
    .order("submitted_at", { ascending: false })
    .limit(500);
  if (statusFilter && statusFilter !== "all") q = q.eq("tracking_status", statusFilter);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const views = await latestViewsByClip((data ?? []).map((r: any) => r.id));
  return (data ?? []).map((r: any) => ({
    id: r.id,
    postUrl: r.post_url,
    platform: r.platform,
    handle: r.account_handle ?? "",
    status: r.tracking_status,
    submittedAt: (r.submitted_at ?? "").slice(0, 16).replace("T", " "),
    clipperId: r.user_id,
    clipperName: r.profiles?.display_name ?? "—",
    clipperEmail: r.profiles?.email ?? "",
    campaignId: r.campaign_id,
    campaignName: r.campaigns?.name ?? "—",
    views: views[r.id] ?? 0,
  }));
}

/**
 * Review a clip. approve: pending_review → tracking (starts earning).
 * reject: pending_review → not_tracking. flag: → flagged (hidden from
 * earnings until reviewed). unflag: flagged → tracking. Every decision
 * notifies the clipper.
 */
export async function reviewClip(
  id: string,
  action: "approve" | "reject" | "flag" | "unflag",
  note?: string
) {
  const user = await requireAdmin();
  const db = adminDb();
  const { data: clip } = await db
    .from("clips")
    .select("id, user_id, tracking_status, campaigns!inner(name)")
    .eq("id", id)
    .single();
  if (!clip) throw new Error("Clip not found.");
  const cur = (clip as any).tracking_status;
  const now = new Date().toISOString();
  const cleanNote = note?.trim() || null;

  if (action === "approve") {
    if (cur !== "pending_review") throw new Error("Only clips awaiting review can be approved.");
    const { error } = await db
      .from("clips")
      .update({ tracking_status: "tracking", reviewed_by: user.id, reviewed_at: now, review_note: cleanNote })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await notifyUser(
      (clip as any).user_id,
      "clip_approved",
      "Clip approved",
      `Your clip for "${(clip as any).campaigns?.name ?? "the campaign"}" was approved and is now tracking views.`
    );
  } else if (action === "reject") {
    if (cur !== "pending_review") throw new Error("Only clips awaiting review can be rejected.");
    const { error } = await db
      .from("clips")
      .update({ tracking_status: "not_tracking", reviewed_by: user.id, reviewed_at: now, review_note: cleanNote })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await notifyUser(
      (clip as any).user_id,
      "clip_rejected",
      "Clip not approved",
      cleanNote
        ? `Your clip for "${(clip as any).campaigns?.name ?? "the campaign"}" was not approved: ${cleanNote}`
        : `Your clip for "${(clip as any).campaigns?.name ?? "the campaign"}" was not approved.`
    );
  } else if (action === "flag") {
    if (cur === "flagged") throw new Error("Clip is already flagged.");
    const { error } = await db
      .from("clips")
      .update({ tracking_status: "flagged", reviewed_by: user.id, reviewed_at: now, review_note: cleanNote })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await notifyUser(
      (clip as any).user_id,
      "clip_flagged",
      "Clip flagged for review",
      `Your clip for "${(clip as any).campaigns?.name ?? "the campaign"}" was flagged and is paused while we review it.`
    );
  } else {
    if (cur !== "flagged") throw new Error("Only flagged clips can be unflagged.");
    const { error } = await db
      .from("clips")
      .update({ tracking_status: "tracking", reviewed_by: user.id, reviewed_at: now, review_note: cleanNote })
      .eq("id", id);
    if (error) throw new Error(error.message);
    await notifyUser(
      (clip as any).user_id,
      "clip_approved",
      "Clip back on track",
      `Your clip for "${(clip as any).campaigns?.name ?? "the campaign"}" passed review and is tracking views again.`
    );
  }
  revalidatePath("/admin/clips");
  revalidatePath("/admin");
  revalidatePath("/dashboard", "layout");
}

// ── Clippers ─────────────────────────────────────────────────

export interface AdminClipper {
  id: string;
  displayName: string;
  email: string;
  status: string;
  joinedAt: string;
  clipCount: number;
  verifiedAccounts: number;
  totalEarned: number;
  pendingPayout: number;
}

export async function getAdminClippers(): Promise<AdminClipper[]> {
  await requireAdmin();
  const db = adminDb();
  const { data: profiles, error } = await db
    .from("profiles")
    .select("id, display_name, email, status, created_at")
    .eq("role", "clipper")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const ids = (profiles ?? []).map((p: any) => p.id);
  const [clips, accounts, payouts] = await Promise.all([
    db.from("clips").select("user_id").in("user_id", ids),
    db.from("social_accounts").select("user_id").in("user_id", ids).eq("verified", true),
    db.from("payouts").select("user_id, estimated_amount, final_amount, status").in("user_id", ids),
  ]);
  const clipCount: Record<string, number> = {};
  for (const c of (clips.data ?? []) as any[]) clipCount[c.user_id] = (clipCount[c.user_id] ?? 0) + 1;
  const acctCount: Record<string, number> = {};
  for (const a of (accounts.data ?? []) as any[]) acctCount[a.user_id] = (acctCount[a.user_id] ?? 0) + 1;
  const earned: Record<string, number> = {};
  const pending: Record<string, number> = {};
  for (const p of (payouts.data ?? []) as any[]) {
    const amt = Number(p.final_amount ?? p.estimated_amount ?? 0);
    earned[p.user_id] = (earned[p.user_id] ?? 0) + amt;
    if (p.status === "pending") pending[p.user_id] = (pending[p.user_id] ?? 0) + amt;
  }
  return (profiles ?? []).map((p: any) => ({
    id: p.id,
    displayName: p.display_name ?? "—",
    email: p.email ?? "",
    status: p.status ?? "active",
    joinedAt: (p.created_at ?? "").slice(0, 10),
    clipCount: clipCount[p.id] ?? 0,
    verifiedAccounts: acctCount[p.id] ?? 0,
    totalEarned: earned[p.id] ?? 0,
    pendingPayout: pending[p.id] ?? 0,
  }));
}

export interface AdminClipperDetail {
  id: string;
  displayName: string;
  email: string;
  status: string;
  bio: string | null;
  joinedAt: string;
  accounts: { id: string; platform: string; handle: string; verified: boolean; followerCount: number }[];
  clips: AdminClip[];
  payouts: { id: string; campaignName: string; amount: number; status: string; totalViews: number; createdAt: string }[];
  totalEarned: number;
}

export async function getAdminClipperDetail(id: string): Promise<AdminClipperDetail | null> {
  await requireAdmin();
  const db = adminDb();
  const { data: profile } = await db
    .from("profiles")
    .select("id, display_name, email, status, bio, created_at")
    .eq("id", id)
    .single();
  if (!profile) return null;
  const [accounts, clips, payouts] = await Promise.all([
    db.from("social_accounts").select("id, platform, handle, verified, follower_count").eq("user_id", id),
    db
      .from("clips")
      .select("id, post_url, platform, account_handle, tracking_status, submitted_at, campaign_id, campaigns!inner(name)")
      .eq("user_id", id)
      .order("submitted_at", { ascending: false }),
    db
      .from("payouts")
      .select("id, estimated_amount, final_amount, status, total_views, created_at, payout_cycles!inner(campaigns!inner(name))")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
  ]);
  const views = await latestViewsByClip((clips.data ?? []).map((r: any) => r.id));
  const totalEarned = ((payouts.data ?? []) as any[]).reduce(
    (s, p) => s + Number(p.final_amount ?? p.estimated_amount ?? 0),
    0
  );
  return {
    id: (profile as any).id,
    displayName: (profile as any).display_name ?? "—",
    email: (profile as any).email ?? "",
    status: (profile as any).status ?? "active",
    bio: (profile as any).bio ?? null,
    joinedAt: ((profile as any).created_at ?? "").slice(0, 10),
    accounts: ((accounts.data ?? []) as any[]).map((a) => ({
      id: a.id,
      platform: a.platform,
      handle: a.handle,
      verified: !!a.verified,
      followerCount: a.follower_count ?? 0,
    })),
    clips: ((clips.data ?? []) as any[]).map((r) => ({
      id: r.id,
      postUrl: r.post_url,
      platform: r.platform,
      handle: r.account_handle ?? "",
      status: r.tracking_status,
      submittedAt: (r.submitted_at ?? "").slice(0, 16).replace("T", " "),
      clipperId: id,
      clipperName: (profile as any).display_name ?? "—",
      clipperEmail: (profile as any).email ?? "",
      campaignId: r.campaign_id,
      campaignName: r.campaigns?.name ?? "—",
      views: views[r.id] ?? 0,
    })),
    payouts: ((payouts.data ?? []) as any[]).map((p) => ({
      id: p.id,
      campaignName: p.payout_cycles?.campaigns?.name ?? "—",
      amount: Number(p.final_amount ?? p.estimated_amount ?? 0),
      status: p.status,
      totalViews: p.total_views ?? 0,
      createdAt: (p.created_at ?? "").slice(0, 10),
    })),
    totalEarned,
  };
}

/** Suspend or reactivate a clipper. Suspended clippers cannot upload new
 *  clips; already-approved clips keep tracking until individually flagged. */
export async function setClipperStatus(id: string, status: "active" | "suspended") {
  await requireAdmin();
  const db = adminDb();
  const { error } = await db.from("profiles").update({ status }).eq("id", id).eq("role", "clipper");
  if (error) throw new Error(error.message);
  await notifyUser(
    id,
    status === "suspended" ? "account_suspended" : "account_reactivated",
    status === "suspended" ? "Your account is suspended" : "Your account is active again",
    status === "suspended"
      ? "Your ClipForge account has been suspended. You cannot upload new clips while suspended. Contact support if you think this is a mistake."
      : "Your ClipForge account has been reactivated. You can upload clips again."
  );
  revalidatePath("/admin/clippers");
  revalidatePath("/admin");
  revalidatePath("/dashboard", "layout");
}

// ── Brands ───────────────────────────────────────────────────

export interface AdminBrand {
  id: string;
  name: string;
  contactEmail: string;
  ownerName: string;
  ownerEmail: string;
  status: string;
  campaignCount: number;
  liveCampaigns: number;
  totalTopups: number;
  createdAt: string;
}

export async function getAdminBrands(): Promise<AdminBrand[]> {
  await requireAdmin();
  const db = adminDb();
  const { data: brands, error } = await db
    .from("brands")
    .select("id, name, contact_email, owner_id, status, created_at, profiles!inner(display_name, email)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  const ids = (brands ?? []).map((b: any) => b.id);
  const [campaigns, topups] = await Promise.all([
    db.from("campaigns").select("brand_id, status").in("brand_id", ids),
    db.from("brand_topups").select("brand_id, amount").in("brand_id", ids),
  ]);
  const campCount: Record<string, number> = {};
  const liveCount: Record<string, number> = {};
  for (const c of (campaigns.data ?? []) as any[]) {
    campCount[c.brand_id] = (campCount[c.brand_id] ?? 0) + 1;
    if (c.status === "active") liveCount[c.brand_id] = (liveCount[c.brand_id] ?? 0) + 1;
  }
  const topupSum: Record<string, number> = {};
  for (const t of (topups.data ?? []) as any[]) topupSum[t.brand_id] = (topupSum[t.brand_id] ?? 0) + Number(t.amount ?? 0);
  return (brands ?? []).map((b: any) => ({
    id: b.id,
    name: b.name,
    contactEmail: b.contact_email ?? "",
    ownerName: b.profiles?.display_name ?? "—",
    ownerEmail: b.profiles?.email ?? "",
    status: b.status ?? "active",
    campaignCount: campCount[b.id] ?? 0,
    liveCampaigns: liveCount[b.id] ?? 0,
    totalTopups: topupSum[b.id] ?? 0,
    createdAt: (b.created_at ?? "").slice(0, 10),
  }));
}

/** Suspend or reactivate a brand. Suspending also pauses its live campaigns
 *  so no new clips come in; reactivating leaves campaigns paused for the
 *  admin to re-activate individually. */
export async function setBrandStatus(id: string, status: "active" | "suspended", reason?: string) {
  await requireAdmin();
  const db = adminDb();
  const { data: brand } = await db.from("brands").select("id, owner_id, name").eq("id", id).single();
  if (!brand) throw new Error("Brand not found.");
  const { error } = await db
    .from("brands")
    .update({ status, suspended_reason: status === "suspended" ? reason?.trim() || null : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  if (status === "suspended") {
    await db.from("campaigns").update({ status: "paused" }).eq("brand_id", id).eq("status", "active");
  }
  await notifyUser(
    (brand as any).owner_id,
    status === "suspended" ? "brand_suspended" : "brand_reactivated",
    status === "suspended" ? `Brand suspended: ${(brand as any).name}` : `Brand active again: ${(brand as any).name}`,
    status === "suspended"
      ? `Your brand was suspended${reason?.trim() ? `: ${reason.trim()}` : "."} Its live campaigns are paused. Contact support to appeal.`
      : "Your brand is active again. Your campaigns stay paused — ask an admin to re-activate them."
  );
  revalidatePath("/admin/brands");
  revalidatePath("/admin");
  revalidatePath("/brand", "layout");
}

// ── Users ────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  displayName: string;
  email: string;
  role: string;
  status: string;
  joinedAt: string;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  await requireAdmin();
  const db = adminDb();
  const { data, error } = await db
    .from("profiles")
    .select("id, display_name, email, role, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => ({
    id: r.id,
    displayName: r.display_name ?? "—",
    email: r.email ?? "",
    role: r.role ?? "clipper",
    status: r.status ?? "active",
    joinedAt: (r.created_at ?? "").slice(0, 10),
  }));
}

/** Change a user's role. Admins cannot change their own role (lockout guard). */
export async function updateUserRole(id: string, role: string) {
  const user = await requireAdmin();
  if (!["clipper", "brand"].includes(role)) throw new Error("Invalid role.");
  if (id === user.id) throw new Error("You cannot change your own role.");
  const db = adminDb();
  const { error } = await db.from("profiles").update({ role }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/users");
  revalidatePath("/admin");
}

// ── Campaigns (full list) ───────────────────────────────────

export interface AdminCampaign {
  id: string;
  slug: string;
  name: string;
  type: string;
  category: string;
  status: string;
  ratePer100k: number;
  budgetCap: number | null;
  platforms: string[];
  brandName: string;
  clipCount: number;
  createdAt: string;
}

export async function getAdminCampaigns(statusFilter?: string): Promise<AdminCampaign[]> {
  await requireAdmin();
  const db = adminDb();
  let q = db
    .from("campaigns")
    .select("id, slug, name, type, category, status, rate_per_100k, budget_cap, platforms, created_at, brands(name)")
    .order("created_at", { ascending: false })
    .limit(500);
  if (statusFilter && statusFilter !== "all") q = q.eq("status", statusFilter);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const ids = (data ?? []).map((r: any) => r.id);
  const { data: clips } = await db.from("clips").select("campaign_id").in("campaign_id", ids);
  const clipCount: Record<string, number> = {};
  for (const c of (clips ?? []) as any[]) clipCount[c.campaign_id] = (clipCount[c.campaign_id] ?? 0) + 1;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    type: r.type,
    category: r.category,
    status: r.status,
    ratePer100k: Number(r.rate_per_100k ?? 0),
    budgetCap: r.budget_cap != null ? Number(r.budget_cap) : null,
    platforms: r.platforms ?? [],
    brandName: r.brands?.name ?? "—",
    clipCount: clipCount[r.id] ?? 0,
    createdAt: (r.created_at ?? "").slice(0, 10),
  }));
}

/** Change the pay rate on a live/paused/pending campaign (Wondeed's CPM editor). */
export async function updateCampaignRate(id: string, ratePer100k: number) {
  await requireAdmin();
  const rate = Number(ratePer100k);
  if (!(rate >= 0)) throw new Error("Rate must be zero or positive.");
  const db = adminDb();
  const { error } = await db
    .from("campaigns")
    .update({ rate_per_100k: rate })
    .eq("id", id)
    .in("status", ["active", "paused", "pending"]);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/campaigns");
  revalidatePath("/admin");
  revalidatePath("/brand", "layout");
}
