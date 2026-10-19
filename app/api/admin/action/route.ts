/**
 * Email-actionable admin endpoint.
 *
 * GET  /api/admin/action?t=<signed token> — verifies the token and renders a
 *                                           CONFIRMATION page. No state changes.
 * POST /api/admin/action                   — form field `t` carries the same
 *                                           token; executes the action and
 *                                           renders the result page.
 *
 * State changes NEVER happen on GET (P1-1): email scanners and link
 * prefetchers only fetch; the admin confirms in the browser, which POSTs the
 * token. The HMAC token (see lib/admin-email.ts) IS the authorization — no
 * session, no login. Tokens expire after 7 days. Every action is additionally
 * guarded on current DB state (only pending items can be acted on), so
 * replaying an old link is harmless: it just reports "already handled".
 */
import { NextRequest } from "next/server";
import { ADMIN_EMAIL } from "@/lib/admin";
import {
  verifyAdminAction,
  formatUsd,
  type AdminAction,
} from "@/lib/admin-email";
import { adminDb } from "@/lib/admin-db";
import { insertNotificationInternal as insertNotification, logAdminActionInternal as logAdminAction } from "@/lib/admin-internal";

export const dynamic = "force-dynamic";

/** Actor label for email-link actions — the signed link only ever goes to
 *  the admin's own inbox, so this is the admin acting without a session. */
const EMAIL_ACTOR = `${ADMIN_EMAIL} (email link)`;

/** HTML-escape for the confirmation/result pages (P0-4 XSS fix). */
function escHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function page(title: string, message: string, ok: boolean): Response {
  const html =
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>` +
    `<title>${escHtml(title)}</title></head>` +
    `<body style="margin:0;background:#fafafa;color:#111;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">` +
    `<div style="max-width:520px;margin:0 auto;padding:64px 24px;text-align:center;">` +
    `<div style="font-size:44px;margin-bottom:16px;">${ok ? "✓" : "✕"}</div>` +
    `<h1 style="font-size:22px;margin:0 0 12px;">${escHtml(title)}</h1>` +
    `<p style="font-size:15px;color:#555;line-height:1.6;">${escHtml(message)}</p>` +
    `<p style="margin-top:32px;font-size:12px;color:#999;">Wondeed admin · this link was for ${ADMIN_EMAIL}</p>` +
    `</div></body></html>`;
  return new Response(html, {
    status: ok ? 200 : 400,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function confirmPage(
  summary: string,
  details: string,
  buttonLabel: string,
  token: string
): Response {
  const html =
    `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>` +
    `<title>${escHtml(summary)} — Wondeed admin</title></head>` +
    `<body style="margin:0;background:#fafafa;color:#111;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">` +
    `<div style="max-width:520px;margin:0 auto;padding:64px 24px;text-align:center;">` +
    `<h1 style="font-size:22px;margin:0 0 12px;">${escHtml(summary)}</h1>` +
    `<p style="font-size:15px;color:#555;line-height:1.6;word-break:break-word;">${escHtml(details)}</p>` +
    `<form method="POST" action="/api/admin/action" style="margin-top:28px;">` +
    `<input type="hidden" name="t" value="${escHtml(token)}"/>` +
    `<button type="submit" style="display:inline-block;padding:14px 40px;background:#111;color:#fff;border:0;border-radius:8px;font-weight:600;font-size:16px;cursor:pointer;font-family:inherit;">${escHtml(buttonLabel)}</button>` +
    `</form>` +
    `<p style="margin-top:24px;font-size:12px;color:#999;">Wondeed admin · confirm to proceed · this link was for ${ADMIN_EMAIL}</p>` +
    `</div></body></html>`;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function actionTitle(action: AdminAction): string {
  return action
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}

const ACTION_BUTTON: Record<AdminAction, string> = {
  approve_clip: "Approve",
  reject_clip: "Reject",
  approve_account: "Approve",
  reject_account: "Reject",
  approve_brand_request: "Approve",
  reject_brand_request: "Reject",
  approve_campaign: "Approve",
  reject_campaign: "Reject",
  record_topup: "Record top-up",
  mark_payout_paid: "Mark paid",
};

async function adminUserId(db: ReturnType<typeof adminDb>): Promise<string | null> {
  const { data } = await db
    .from("profiles")
    .select("id")
    .eq("email", ADMIN_EMAIL)
    .maybeSingle();
  return (data as any)?.id ?? null;
}

async function doClip(
  db: ReturnType<typeof adminDb>,
  id: string,
  action: "approve_clip" | "reject_clip"
): Promise<{ ok: boolean; message: string }> {
  const { data: clip } = await db
    .from("clips")
    .select("id, user_id, tracking_status, post_url, campaigns(name)")
    .eq("id", id)
    .single();
  if (!clip) return { ok: false, message: "Clip not found. It may have been deleted." };
  if ((clip as any).tracking_status !== "pending_review")
    return {
      ok: true,
      message: `Already handled — this clip is now “${(clip as any).tracking_status}”. Nothing to do.`,
    };
  const now = new Date().toISOString();
  const reviewer = await adminUserId(db);
  const next = action === "approve_clip" ? "tracking" : "not_tracking";
  const { error } = await db
    .from("clips")
    .update({ tracking_status: next, reviewed_by: reviewer, reviewed_at: now })
    .eq("id", id);
  if (error) return { ok: false, message: `Database error: ${error.message}` };
  const campaignName = (clip as any).campaigns?.name ?? "the campaign";
  await logAdminAction({
    actor: EMAIL_ACTOR,
    action: action === "approve_clip" ? "clip.approve" : "clip.reject",
    targetType: "clip",
    targetId: id,
    summary: `${action === "approve_clip" ? "Approved" : "Rejected"} clip for “${campaignName}” via email link`,
  });
  await insertNotification(
    (clip as any).user_id,
    action === "approve_clip" ? "clip_approved" : "clip_rejected",
    action === "approve_clip" ? "Clip approved" : "Clip not approved",
    action === "approve_clip"
      ? `Your clip for “${campaignName}” was approved and is now tracking views.`
      : `Your clip for “${campaignName}” was not approved.`
  );
  return {
    ok: true,
    message:
      action === "approve_clip"
        ? `Clip approved — it is now tracking views for “${campaignName}”. The clipper has been notified.`
        : `Clip rejected. The clipper has been notified.`,
  };
}

async function doAccount(
  db: ReturnType<typeof adminDb>,
  id: string,
  action: "approve_account" | "reject_account"
): Promise<{ ok: boolean; message: string }> {
  const { data: acct } = await db
    .from("social_accounts")
    .select("id, platform, handle, verified, user_id")
    .eq("id", id)
    .single();
  if (!acct) {
    // Rejects delete the row — a missing row after a reject link is "already handled".
    return { ok: true, message: "Already handled — this account request no longer exists." };
  }
  if ((acct as any).verified)
    return { ok: true, message: "Already handled — this account is already verified." };
  if (action === "approve_account") {
    const { error } = await db
      .from("social_accounts")
      .update({ verified: true, verified_at: new Date().toISOString() })
      .eq("id", id);
    if (error) return { ok: false, message: `Database error: ${error.message}` };
    await logAdminAction({
      actor: EMAIL_ACTOR,
      action: "account.approve",
      targetType: "social_account",
      targetId: id,
      summary: `Verified ${(acct as any).platform} account ${(acct as any).handle} via email link`,
    });
    await insertNotification(
      (acct as any).user_id,
      "account_verified",
      "Account verified",
      `Your ${(acct as any).platform} account ${(acct as any).handle} is verified — you can now upload clips from it.`
    );
    return { ok: true, message: `Account ${(acct as any).handle} verified. The clipper has been notified.` };
  }
  const { error } = await db.from("social_accounts").delete().eq("id", id);
  if (error) return { ok: false, message: `Database error: ${error.message}` };
  await logAdminAction({
    actor: EMAIL_ACTOR,
    action: "account.reject",
    targetType: "social_account",
    targetId: id,
    summary: `Rejected account request via email link (removed)`,
  });
  return { ok: true, message: `Account request rejected and removed. The clipper can re-add it.` };
}

async function doBrandRequest(
  db: ReturnType<typeof adminDb>,
  id: string,
  action: "approve_brand_request" | "reject_brand_request"
): Promise<{ ok: boolean; message: string }> {
  const { data: row } = await db
    .from("brand_requests")
    .select("id, user_id, company_name, contact_name, email, status")
    .eq("id", id)
    .single();
  if (!row) return { ok: false, message: "Brand request not found." };
  if ((row as any).status !== "pending")
    return { ok: true, message: `Already handled — this request is “${(row as any).status}”.` };
  if (action === "reject_brand_request") {
    await db
      .from("brand_requests")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    await logAdminAction({
      actor: EMAIL_ACTOR,
      action: "brand_request.reject",
      targetType: "brand_request",
      targetId: id,
      summary: `Rejected brand request from “${(row as any).company_name}” via email link`,
    });
    return { ok: true, message: `Brand request from ${(row as any).company_name} rejected.` };
  }
  const { error: roleErr } = await db
    .from("profiles")
    .update({ role: "brand" })
    .eq("id", (row as any).user_id);
  if (roleErr) return { ok: false, message: `Database error: ${roleErr.message}` };
  const { error: brandErr } = await db.from("brands").upsert(
    {
      owner_id: (row as any).user_id,
      name: (row as any).company_name,
      contact_email: (row as any).email,
    },
    { onConflict: "owner_id" }
  );
  if (brandErr) return { ok: false, message: `Database error: ${brandErr.message}` };
  await db
    .from("brand_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", id);
  await logAdminAction({
    actor: EMAIL_ACTOR,
    action: "brand_request.approve",
    targetType: "brand_request",
    targetId: id,
    summary: `Approved brand request from “${(row as any).company_name}” via email link`,
  });
  await insertNotification(
    (row as any).user_id,
    "brand_approved",
    "Brand access approved",
    `Your brand “${(row as any).company_name}” was approved — you can now create campaigns.`
  );
  return {
    ok: true,
    message: `“${(row as any).company_name}” approved as a brand. They have been notified.`,
  };
}

/**
 * Brand balance = funded (sum of brand_topups.amount) − spent
 * (sum of payouts.estimated_amount across the brand's campaigns).
 */
async function brandBalance(db: ReturnType<typeof adminDb>, brandId: string): Promise<number> {
  const { data: topups } = await db.from("brand_topups").select("amount").eq("brand_id", brandId);
  const funded = (topups ?? []).reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
  const { data: camps } = await db.from("campaigns").select("id").eq("brand_id", brandId);
  const campIds = (camps ?? []).map((c: any) => c.id);
  let spent = 0;
  if (campIds.length > 0) {
    const { data: cycles } = await db.from("payout_cycles").select("id").in("campaign_id", campIds);
    const cycleIds = (cycles ?? []).map((c: any) => c.id);
    if (cycleIds.length > 0) {
      const { data: payouts } = await db.from("payouts").select("estimated_amount").in("cycle_id", cycleIds);
      spent = (payouts ?? []).reduce((s: number, p: any) => s + Number(p.estimated_amount ?? 0), 0);
    }
  }
  return funded - spent;
}

async function doCampaign(
  db: ReturnType<typeof adminDb>,
  id: string,
  action: "approve_campaign" | "reject_campaign"
): Promise<{ ok: boolean; message: string }> {
  const { data: row } = await db
    .from("campaigns")
    .select("id, name, status, brand_id")
    .eq("id", id)
    .single();
  if (!row) {
    return { ok: true, message: "Already handled — this campaign no longer exists." };
  }
  if ((row as any).status !== "pending")
    return { ok: true, message: `Already handled — this campaign is “${(row as any).status}”.` };
  const reviewer = await adminUserId(db);
  if (action === "approve_campaign") {
    // P1-4: balance gate — don't launch a campaign the brand can't pay for.
    const balance = await brandBalance(db, (row as any).brand_id);
    if (balance <= 0)
      return { ok: false, message: "Brand balance is $0 — ask the brand to top up first." };
    const { error } = await db
      .from("campaigns")
      .update({ status: "active", reviewed_by: reviewer, reviewed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "pending");
    if (error) return { ok: false, message: `Database error: ${error.message}` };
    await logAdminAction({
      actor: EMAIL_ACTOR,
      action: "campaign.approve",
      targetType: "campaign",
      targetId: id,
      summary: `Approved campaign “${(row as any).name}” via email link (now live)`,
    });
    return { ok: true, message: `Campaign “${(row as any).name}” is now live.` };
  }
  // Reject deletes the brief so the brand can resubmit (same as /admin).
  const { data: brand } = await db
    .from("brands")
    .select("owner_id")
    .eq("id", (row as any).brand_id)
    .single();
  await db.from("campaigns").delete().eq("id", id);
  await logAdminAction({
    actor: EMAIL_ACTOR,
    action: "campaign.reject",
    targetType: "campaign",
    targetId: id,
    summary: `Rejected campaign “${(row as any).name}” via email link (removed)`,
  });
  if ((brand as any)?.owner_id) {
    await insertNotification(
      (brand as any).owner_id,
      "campaign_rejected",
      `Campaign brief not approved: ${(row as any).name}`,
      "Please revise the brief and resubmit."
    );
  }
  return { ok: true, message: `Campaign “${(row as any).name}” rejected and removed. The brand was notified.` };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Parse a record_topup token id: `${brandId}|${amount}|${reference}`
 * (see notifyTopupRequest in lib/admin-email.ts). Validates shape —
 * tampering already breaks the HMAC signature.
 */
function parseTopupId(
  id: string
): { brandId: string; amount: number; reference: string } | null {
  const parts = id.split("|");
  if (parts.length < 3) return null;
  const brandId = parts[0];
  const amount = Number(parts[1]);
  const reference = parts.slice(2).join("|");
  if (!UUID_RE.test(brandId)) return null;
  if (!Number.isFinite(amount) || !(amount > 0)) return null;
  if (reference.length > 120) return null;
  return { brandId, amount, reference };
}

async function doTopup(
  db: ReturnType<typeof adminDb>,
  id: string
): Promise<{ ok: boolean; message: string }> {
  const parsed = parseTopupId(id);
  if (!parsed) return { ok: false, message: "Invalid top-up link." };
  const { brandId, amount, reference } = parsed;
  const { data: brand } = await db.from("brands").select("id, name").eq("id", brandId).single();
  if (!brand) return { ok: false, message: "Brand not found." };
  const brandName = (brand as any).name ?? "the brand";
  // Idempotency: replaying the link within an hour of a matching row is
  // "already handled" instead of double-counting the top-up.
  const oneHourAgo = new Date(Date.now() - 3600_000).toISOString();
  const { data: recent } = await db
    .from("brand_topups")
    .select("amount, reference")
    .eq("brand_id", brandId)
    .gte("created_at", oneHourAgo)
    .limit(50);
  const dup = (recent ?? []).some(
    (r: any) => Number(r.amount ?? 0) === amount && (r.reference ?? "") === reference
  );
  if (dup)
    return {
      ok: true,
      message: `Already handled — this ${formatUsd(amount)} top-up for “${brandName}” was already recorded.`,
    };
  const { error } = await db.from("brand_topups").insert({
    brand_id: brandId,
    amount,
    method: null,
    reference,
  });
  if (error) return { ok: false, message: `Database error: ${error.message}` };
  await logAdminAction({
    actor: EMAIL_ACTOR,
    action: "topup.record",
    targetType: "brand",
    targetId: brandId,
    summary: `Recorded ${formatUsd(amount)} top-up for “${brandName}” via email link`,
    metadata: { amount, reference },
  });
  return {
    ok: true,
    message: `Top-up recorded: ${formatUsd(amount)} for “${brandName}”${reference ? ` (ref: ${reference})` : ""}.`,
  };
}

async function doMarkPaid(
  db: ReturnType<typeof adminDb>,
  id: string
): Promise<{ ok: boolean; message: string }> {
  const { data: row } = await db
    .from("payouts")
    .select("id, status, estimated_amount, user_id, profiles(display_name)")
    .eq("id", id)
    .single();
  if (!row) return { ok: false, message: "Payout not found." };
  if ((row as any).status !== "pending")
    return { ok: true, message: `Already handled — this payout is “${(row as any).status}”.` };
  const amount = Number((row as any).estimated_amount ?? 0);
  const { error } = await db
    .from("payouts")
    .update({ status: "paid", final_amount: amount })
    .eq("id", id)
    .eq("status", "pending");
  if (error) return { ok: false, message: `Database error: ${error.message}` };
  await logAdminAction({
    actor: EMAIL_ACTOR,
    action: "payout.mark_paid",
    targetType: "payout",
    targetId: id,
    summary: `Marked payout ${formatUsd(amount)} as paid via email link`,
    metadata: { amount },
  });
  if ((row as any).user_id) {
    await insertNotification(
      (row as any).user_id,
      "payout_settled",
      "Payout settled!",
      `Your payout of ${formatUsd(amount)} has been marked as paid.`
    );
  }
  return {
    ok: true,
    message: `Payout of ${formatUsd(amount)} marked as paid. The clipper has been notified.`,
  };
}

async function runAction(
  db: ReturnType<typeof adminDb>,
  action: AdminAction,
  id: string
): Promise<{ ok: boolean; message: string }> {
  if (action === "approve_clip" || action === "reject_clip") return doClip(db, id, action);
  if (action === "approve_account" || action === "reject_account") return doAccount(db, id, action);
  if (action === "approve_brand_request" || action === "reject_brand_request")
    return doBrandRequest(db, id, action);
  if (action === "approve_campaign" || action === "reject_campaign") return doCampaign(db, id, action);
  if (action === "record_topup") return doTopup(db, id);
  if (action === "mark_payout_paid") return doMarkPaid(db, id);
  const _exhaustive: never = action;
  throw new Error(`Unknown action: ${_exhaustive}`);
}

// ── GET confirmation page (no state changes) ──────────────────

interface Summary {
  summary: string;
  details: string;
  button: string;
}

async function actionSummary(
  db: ReturnType<typeof adminDb>,
  action: AdminAction,
  id: string
): Promise<Summary> {
  const button = ACTION_BUTTON[action];
  try {
    if (action === "approve_clip" || action === "reject_clip") {
      const { data: clip } = await db
        .from("clips")
        .select("post_url, platform, account_handle, tracking_status, campaigns(name)")
        .eq("id", id)
        .single();
      if (!clip)
        return { summary: actionTitle(action), details: "This clip no longer exists — nothing to do.", button };
      return {
        summary: actionTitle(action),
        details:
          `${(clip as any).platform ?? ""}${(clip as any).account_handle ? ` · ${(clip as any).account_handle}` : ""}` +
          ` — campaign “${(clip as any).campaigns?.name ?? "—"}”. Clip: ${(clip as any).post_url ?? "—"}. ` +
          `Currently: ${(clip as any).tracking_status}.`,
        button,
      };
    }
    if (action === "approve_account" || action === "reject_account") {
      const { data: acct } = await db
        .from("social_accounts")
        .select("platform, handle, verified")
        .eq("id", id)
        .single();
      if (!acct)
        return { summary: actionTitle(action), details: "This account request no longer exists — nothing to do.", button };
      return {
        summary: actionTitle(action),
        details: `${(acct as any).platform} · ${(acct as any).handle}. Currently: ${(acct as any).verified ? "verified" : "pending"}.`,
        button,
      };
    }
    if (action === "approve_brand_request" || action === "reject_brand_request") {
      const { data: row } = await db
        .from("brand_requests")
        .select("company_name, contact_name, email, status")
        .eq("id", id)
        .single();
      if (!row)
        return { summary: actionTitle(action), details: "This brand request no longer exists — nothing to do.", button };
      return {
        summary: `${actionTitle(action)} — ${(row as any).company_name}`,
        details: `${(row as any).contact_name} (${(row as any).email}). Currently: ${(row as any).status}.`,
        button,
      };
    }
    if (action === "approve_campaign" || action === "reject_campaign") {
      const { data: row } = await db
        .from("campaigns")
        .select("name, status, rate_per_100k, brands(name)")
        .eq("id", id)
        .single();
      if (!row)
        return { summary: actionTitle(action), details: "This campaign no longer exists — nothing to do.", button };
      return {
        summary: `${actionTitle(action)} — ${(row as any).name}`,
        details:
          `Brand: ${(row as any).brands?.name ?? "—"} · Rate: ${formatUsd(Number((row as any).rate_per_100k ?? 0))} / 100k views. ` +
          `Currently: ${(row as any).status}.`,
        button,
      };
    }
    if (action === "record_topup") {
      const p = parseTopupId(id);
      if (!p) return { summary: "Record top-up", details: "This link is malformed — no action needed.", button };
      const { data: brand } = await db.from("brands").select("name").eq("id", p.brandId).single();
      return {
        summary: `Record top-up — ${(brand as any)?.name ?? "unknown brand"}`,
        details: `Amount: ${formatUsd(p.amount)}${p.reference ? ` · Reference: ${p.reference}` : ""}.`,
        button,
      };
    }
    if (action === "mark_payout_paid") {
      const { data: row } = await db
        .from("payouts")
        .select("status, estimated_amount, total_views, total_clips, profiles(display_name)")
        .eq("id", id)
        .single();
      if (!row)
        return { summary: "Mark payout as paid", details: "This payout no longer exists — nothing to do.", button };
      return {
        summary: `Mark payout as paid — ${(row as any).profiles?.display_name ?? "clipper"}`,
        details:
          `Amount: ${formatUsd(Number((row as any).estimated_amount ?? 0))} · ` +
          `${Number((row as any).total_views ?? 0).toLocaleString("en-US")} views · ` +
          `${(row as any).total_clips ?? 0} clips. Currently: ${(row as any).status}.`,
        button,
      };
    }
    const _exhaustive: never = action;
    throw new Error(`Unknown action: ${_exhaustive}`);
  } catch (e) {
    // Never fail the confirmation page on a details fetch — the POST handler
    // re-checks everything before mutating.
    return {
      summary: actionTitle(action),
      details: "Item details could not be loaded — the link itself is still valid.",
      button,
    };
  }
}

function invalidLink(): Response {
  return page(
    "Link invalid or expired",
    "This admin link is invalid, expired (links last 7 days), or was tampered with. Open the latest email for a fresh link.",
    false
  );
}

export async function GET(req: NextRequest): Promise<Response> {
  const token = req.nextUrl.searchParams.get("t") || "";
  const parsed = verifyAdminAction(token);
  if (!parsed) return invalidLink();

  let db: ReturnType<typeof adminDb>;
  try {
    db = adminDb();
  } catch (e) {
    return page("Admin not configured", (e as Error).message, false);
  }

  const { summary, details, button } = await actionSummary(db, parsed.action, parsed.id);
  return confirmPage(summary, details, button, token);
}

export async function POST(req: NextRequest): Promise<Response> {
  let token = "";
  try {
    const form = await req.formData();
    token = String(form.get("t") || "");
  } catch {
    /* malformed body — token stays empty */
  }
  const parsed = verifyAdminAction(token);
  if (!parsed) return invalidLink();

  let db: ReturnType<typeof adminDb>;
  try {
    db = adminDb();
  } catch (e) {
    return page("Admin not configured", (e as Error).message, false);
  }

  try {
    const result = await runAction(db, parsed.action, parsed.id);
    const title = actionTitle(parsed.action);
    return page(result.ok ? `${title} ✓` : "Something went wrong", result.message, result.ok);
  } catch (e) {
    return page("Something went wrong", (e as Error).message, false);
  }
}
