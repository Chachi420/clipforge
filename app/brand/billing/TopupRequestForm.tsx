"use client";
import { useState } from "react";
import { Button, Field, inputCls } from "@/components/ui";
import { requestTopup } from "@/lib/brand-actions";

/** Brand asks the admin to record a top-up after paying off-platform. */
export default function TopupRequestForm() {
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return setError("Enter an amount greater than $0.");
    if (amt > 100000) return setError("Top-up requests are capped at $100,000.");
    setSubmitting(true);
    try {
      await requestTopup({ amount: amt, reference });
      setSent(true);
    } catch (e: any) {
      setError(e.message ?? "Could not send the request — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-4 rounded-card border border-status-success/30 bg-status-success/10 px-4 py-4">
        <p className="text-sm font-semibold text-ink">Top-up request sent.</p>
        <p className="mt-1 text-sm text-ink-soft">
          Our team will confirm once the funds are received and record the top-up
          in your ledger below.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      {error && (
        <p className="rounded-md bg-status-error/10 px-4 py-2.5 text-sm text-status-error">{error}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Amount (USD)">
          <input
            className={inputCls}
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 500"
            required
          />
        </Field>
        <Field label="Payment reference (optional)">
          <input
            className={inputCls}
            type="text"
            maxLength={120}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. wire ref, PayPal txn id"
          />
        </Field>
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending…" : "Request top-up"}
      </Button>
    </form>
  );
}
