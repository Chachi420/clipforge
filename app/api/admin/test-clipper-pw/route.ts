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
  const users = (data?.users ?? []).map((u: any) => ({ email: u.email, id: u.id.slice(0,8), created: u.created_at }));
  const { data: profiles } = await svc.from("profiles").select("id, email, role").limit(100);
  return NextResponse.json({ users, profileCount: profiles?.length ?? 0, profiles: profiles?.map((p: any) => ({ email: p.email, role: p.role })) });
}
