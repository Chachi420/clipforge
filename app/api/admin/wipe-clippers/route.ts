import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * ONE-TIME cleanup: delete all auth users whose profile role is 'clipper'
 * (cascades to profiles + user data). Owner-requested before signup testing.
 * Protected by a one-time token. Remove this route after use.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const expected = process.env.WIPE_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const svc = createServiceClient();
  if (!svc) {
    return NextResponse.json({ error: "service client not configured" }, { status: 500 });
  }

  // Find clipper-role profiles.
  const { data: profiles, error: pErr } = await svc
    .from("profiles")
    .select("id")
    .eq("role", "clipper");
  if (pErr) return NextResponse.json({ error: pErr.message }, { status: 500 });

  const ids = (profiles ?? []).map((p: any) => p.id);
  const deleted: string[] = [];
  const failed: { id: string; error: string }[] = [];
  for (const id of ids) {
    const { error } = await svc.auth.admin.deleteUser(id);
    if (error) failed.push({ id, error: error.message });
    else deleted.push(id);
  }
  return NextResponse.json({ deleted: deleted.length, failed });
}
