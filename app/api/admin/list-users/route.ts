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
  const email = `flowtest+${Date.now()}@clipforge.test`;
  const { data, error } = await svc.auth.admin.createUser({
    email, password: "TestFlow123!", email_confirm: true,
    user_metadata: { display_name: "Flow Test" },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ email, password: "TestFlow123!" });
}
