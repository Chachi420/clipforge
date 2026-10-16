import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ error: "gone" }, { status: 410 }); }
