import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;
const MAX_TOPIC = 50;

// Basic shape check — the browser's type="email" input does the first pass,
// this is the server-side backstop. No new dependencies.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * POST /api/contact — stores a contact-form submission.
 *
 * Writes go through the anon-key client; the RLS insert-only policy on
 * contact_messages is the authorization boundary (no select/update/delete
 * for clients). A `company` honeypot field silently accepts bot submissions
 * without storing them.
 */
export async function POST(request: NextRequest) {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request body.");
  }

  // Honeypot: bots fill it, humans never see it. Accept silently, drop it.
  if (typeof body?.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const topic = typeof body?.topic === "string" ? body.topic.trim() : "";

  if (!name || name.length > MAX_NAME) return bad("Please include your name (100 characters max).");
  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL)
    return bad("Please include a valid email address.");
  if (!message || message.length > MAX_MESSAGE)
    return bad("Please write a message (5000 characters max).");
  if (topic.length > MAX_TOPIC) return bad("Invalid topic.");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("[api/contact] Supabase not configured — dropping submission");
    return NextResponse.json(
      { error: "The contact form is temporarily unavailable. Please try again later." },
      { status: 503 }
    );
  }

  const storedMessage = topic ? `[${topic}] ${message}` : message;
  const supabase = createClient();
  const { error } = await supabase
    .from("contact_messages")
    .insert({ name, email, message: storedMessage });

  if (error) {
    console.error("[api/contact] insert failed:", error.message);
    return NextResponse.json(
      { error: "Something went wrong sending your message. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
