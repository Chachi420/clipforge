import { NextResponse } from "next/server";

/** Tombstone: one-time Kick campaign insert route, removed after use. */
export async function GET() {
  return NextResponse.json({ error: "gone" }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ error: "gone" }, { status: 410 });
}
