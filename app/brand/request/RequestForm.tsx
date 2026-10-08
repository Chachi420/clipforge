"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { requestBrandAccess } from "@/lib/brand-actions";

const BUDGETS = [
  { v: "under_1k", label: "Under $1,000 / month" },
  { v: "1k_5k", label: "$1,000 – $5,000 / month" },
  { v: "5k_25k", label: "$5,000 – $25,000 / month" },
  { v: "25k_plus", label: "$25,000+ / month" },
];

const inputCls =
  "w-full rounded-xl border border-white/10 bg-base-900 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-accent focus:outline-none";

export default function RequestForm({ defaultEmail }: { defaultEmail: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    try {
      await requestBrandAccess({
        companyName: String(fd.get("company") ?? ""),
        contactName: String(fd.get("name") ?? ""),
        email: String(fd.get("email") ?? ""),
        website: String(fd.get("website") ?? ""),
        budgetRange: String(fd.get("budget") ?? ""),
        message: String(fd.get("message") ?? ""),
      });
      router.refresh();
    } catch (e: any) {
      setErr(e?.message ?? "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Company name *</label>
          <input name="company" required placeholder="Acme Inc." className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Your name *</label>
          <input name="name" required placeholder="Jane Doe" className={inputCls} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Work email *</label>
          <input name="email" type="email" required defaultValue={defaultEmail} className={inputCls} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-white/60">Website</label>
          <input name="website" placeholder="https://…" className={inputCls} />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-white/60">Monthly budget *</label>
        <select name="budget" required defaultValue="" className={inputCls}>
          <option value="" disabled>Select a range…</option>
          {BUDGETS.map((b) => (
            <option key={b.v} value={b.v}>{b.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-white/60">
          What do you want to promote?
        </label>
        <textarea
          name="message"
          rows={4}
          placeholder="Tell us about your content and goals…"
          className={inputCls}
        />
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <Button type="submit" disabled={saving} className="w-full py-3">
        {saving ? "Sending…" : "Request brand access"}
      </Button>
      <p className="text-center text-xs text-white/35">
        We review every request by hand — usually within one business day.
      </p>
    </form>
  );
}
