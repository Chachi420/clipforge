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
