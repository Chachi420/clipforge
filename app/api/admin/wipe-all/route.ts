import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * ONE-TIME: delete ALL auth users (cascade clears profiles + user data).
 * Owner-requested to retry signup fresh. Protected by one-time token.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const expected = process.env.WIPE_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "no svc" }, { status: 500 });

  const { data, error: lErr } = await svc.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  const deleted: string[] = [];
  const failed: { email: string; error: string }[] = [];
  for (const u of data?.users ?? []) {
    const { error } = await svc.auth.admin.deleteUser(u.id);
    if (error) failed.push({ email: u.email ?? u.id, error: error.message });
    else deleted.push(u.email ?? u.id);
  }
  return NextResponse.json({ deleted, failed });
}
