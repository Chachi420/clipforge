import { NextResponse } from "next/server";

/** Tombstone: one-time account wipe route, removed after use. */
export async function GET() {
  return NextResponse.json({ error: "gone" }, { status: 410 });
}
