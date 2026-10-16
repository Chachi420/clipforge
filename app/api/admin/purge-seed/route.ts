import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isAdminUser } from "@/lib/admin";

/**
 * ONE-TIME cleanup: delete dev seed campaigns from production.
 * Admin-email gated. Remove this route after use.
 */
const SEED_SLUGS = ["kick-clipping", "clix-and-lacy", "rumble"];

export async function POST() {
  return purge();
}

/** GET for one-click browser trigger (still admin-gated via session). */
export async function GET() {
  return purge();
}

async function purge() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const svc = createServiceClient();
  if (!svc) {
    return NextResponse.json({ error: "service client not configured" }, { status: 500 });
  }
  const { data, error } = await svc
    .from("campaigns")
    .delete()
    .in("slug", SEED_SLUGS)
    .select("slug");
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ deleted: (data ?? []).map((r: any) => r.slug) });
}
