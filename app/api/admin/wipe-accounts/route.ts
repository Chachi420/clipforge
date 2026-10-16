import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * ONE-TIME cleanup: delete ALL auth users (cascades to profiles + all user
 * data via on-delete-cascade FKs). Owner-requested clean slate.
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

  // List all users (paginate just in case).
  const ids: string[] = [];
  let page = 1;
  for (;;) {
    const { data, error } = await svc.auth.admin.listUsers({ page, perPage: 100 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    ids.push(...data.users.map((u) => u.id));
    if (data.users.length < 100) break;
    page++;
  }

  const deleted: string[] = [];
  const failed: { id: string; error: string }[] = [];
  for (const id of ids) {
    const { error } = await svc.auth.admin.deleteUser(id);
    if (error) failed.push({ id, error: error.message });
    else deleted.push(id);
  }
  return NextResponse.json({ deleted: deleted.length, failed });
}
