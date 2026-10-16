import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const expected = process.env.WIPE_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "no svc" }, { status: 500 });
  const { data } = await svc.auth.admin.listUsers({ page: 1, perPage: 100 });
  const deleted: string[] = [];
  for (const u of data?.users ?? []) {
    const { error } = await svc.auth.admin.deleteUser(u.id);
    if (!error) deleted.push(u.email ?? u.id);
  }
  return NextResponse.json({ deleted, count: deleted.length });
}
