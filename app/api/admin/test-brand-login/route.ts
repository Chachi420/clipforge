import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * ONE-TIME: create a test brand user + magic link so the owner can see the
 * brand side. Protected by one-time token. Remove after use.
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

  const email = `brandtest+${Date.now()}@clipforge.test`;
  const { data: userData, error: cErr } = await svc.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { display_name: "Test Brand" },
  });
  if (cErr) return NextResponse.json({ error: cErr.message }, { status: 500 });
  const userId = userData.user.id;

  // Make them a brand.
  const { error: rErr } = await svc.from("profiles").update({ role: "brand" }).eq("id", userId);
  if (rErr) return NextResponse.json({ error: rErr.message }, { status: 500 });

  // Create a brand record.
  const { error: bErr } = await svc.from("brands").insert({
    owner_id: userId,
    name: "Test Brand Co",
    contact_email: email,
  });
  if (bErr) return NextResponse.json({ error: bErr.message }, { status: 500 });

  // Magic link (one-time, no email sent).
  const { data: linkData, error: lErr } = await svc.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 });

  return NextResponse.json({ magicLink: (linkData as any).properties.action_link, userId, email });
}
