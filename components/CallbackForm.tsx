"use client";
import { useState } from "react";
import { Phone } from "lucide-react";
import { Button, Card, Field, inputCls } from "@/components/ui";
import { requestCallback } from "@/lib/actions";

/**
 * Phone-callback sales form for the /brands page.
 * India B2B runs on phone calls — "Share a number, we'll call."
 * Monochrome, matches existing marketing forms.
 */
export default function CallbackForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await requestCallback({ name, phone, company, message });
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "Could not submit. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <Card className="p-6 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ink text-paper">
          <Phone size={20} aria-hidden />
        </div>
        <h3 className="display mt-4 text-xl text-ink">We&apos;ll call you back</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">
          Thanks, {name.trim().split(" ")[0]}. Our team will reach out on{" "}
          <span className="tnum font-semibold text-ink">+91 {phone.replace(/\D/g, "").slice(-10)}</span>{" "}
          within one business day.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-paper">
          <Phone size={18} aria-hidden />
        </div>
        <div>
          <h3 className="display text-lg text-ink">Prefer a call?</h3>
          <p className="text-sm text-ink-soft">Share your number — we&apos;ll call you back.</p>
        </div>
      </div>
      <form onSubmit={submit} className="mt-5 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </Field>
          <Field label="Mobile number">
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
                +91
              </span>
              <input
                className={`${inputCls} pl-12`}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s-]/g, ""))}
                placeholder="98765 43210"
                inputMode="tel"
                autoComplete="tel"
                required
              />
            </div>
          </Field>
        </div>
        <Field label="Company (optional)">
          <input
            className={inputCls}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Your brand or company"
            autoComplete="organization"
          />
        </Field>
        <Field label="What do you want to promote? (optional)">
          <textarea
            className={inputCls}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us about your goals…"
            rows={3}
          />
        </Field>
        {error && (
          <p className="rounded-md bg-status-error/10 px-3 py-2 text-sm text-status-error">{error}</p>
        )}
        <Button type="submit" variant="primary" disabled={saving} className="w-full sm:w-auto">
          {saving ? "Sending…" : "Request a callback"}
        </Button>
        <p className="text-xs text-ink-faint">
          By submitting, you agree to be contacted about Wondeed brand campaigns.
        </p>
      </form>
    </Card>
  );
}
