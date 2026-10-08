import { NextResponse } from "next/server";
import { exchangeCodeForSession } from "@/lib/auth";

/** After OAuth, send brand logins to /brand (via ?next=) and everyone else to /dashboard. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";

  if (code) {
    const { error } = await exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${safeNext}`);
  }
  return NextResponse.redirect(`${origin}/login`);
}
