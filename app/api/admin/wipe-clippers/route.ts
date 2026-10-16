import { NextResponse } from "next/server";

/** Tombstone: one-time clipper wipe route, removed after use. */
export async function GET() {
  return NextResponse.json({ error: "gone" }, { status: 410 });
}
