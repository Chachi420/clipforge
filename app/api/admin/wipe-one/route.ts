import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const expected = process.env.WIPE_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const email = url.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "email required" }, { status: 400 });
  const svc = createServiceClient();
  if (!svc) return NextResponse.json({ error: "no svc" }, { status: 500 });
  const { data } = await svc.auth.admin.listUsers({ page: 1, perPage: 100 });
  const target = (data?.users ?? []).find((u: any) => u.email === email);
  if (!target) return NextResponse.json({ error: "not found" }, { status: 404 });
  const { error } = await svc.auth.admin.deleteUser(target.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deleted: email });
}
