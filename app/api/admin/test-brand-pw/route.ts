import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * ONE-TIME: set a known password on the latest test brand user.
 * Protected by one-time token. Remove after use.
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

  // Find the most recent test brand user.
  const { data: users } = await svc.auth.admin.listUsers({ page: 1, perPage: 100 });
  const testUser = (users?.users ?? [])
    .filter((u: any) => u.email?.includes("brandtest+"))
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  if (!testUser) return NextResponse.json({ error: "no test user" }, { status: 404 });

  const password = "TestBrand123!";
  const { error } = await svc.auth.admin.updateUserById(testUser.id, { password });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ email: testUser.email, password, userId: testUser.id });
}
