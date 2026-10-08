"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, EmptyState, Field, inputCls } from "@/components/ui";
import { getAllBrands, getRecentTopups, recordTopup } from "@/lib/admin-actions";
import { formatMoney } from "@/lib/format";

type Brands = Awaited<ReturnType<typeof getAllBrands>>;
type Topups = Awaited<ReturnType<typeof getRecentTopups>>;

const METHOD_LABELS: Record<string, string> = {
  paypal: "PayPal",
  crypto: "Crypto",
  wire: "Wire",
};

export default function TopupRecorder({ brands, initial }: { brands: Brands; initial: Topups }) {
  const [brandId, setBrandId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [reference, setReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  async function handleRecord() {
    const amt = Number(amount);
    if (!brandId) {
      setError("Pick a brand first.");
      return;
    }
    if (!(amt > 0)) {
      setError("Enter a positive amount.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await recordTopup({
        brandId,
        amount: amt,
        method: method || undefined,
        reference: reference || undefined,
      });
      const brandName = brands.find((b) => b.id === brandId)?.name ?? "brand";
      setSuccess(`Recorded ${formatMoney(amt)} top-up for ${brandName}.`);
      setAmount("");
      setMethod("");
      setReference("");
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Record top-up failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 p-6">
        <h2 className="text-base font-bold text-white">Record a top-up</h2>
        {error && (
          <p className="rounded-xl bg-red-500/10 px-4 py-2.5 text-sm text-red-300">{error}</p>
        )}
        {success && (
          <p className="rounded-xl bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
            {success}
          </p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand">
            <select
              className={inputCls}
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
            >
              <option value="">Select a brand…</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Amount (USD)">
            <input
              className={inputCls}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              inputMode="decimal"
              type="number"
              min="0"
              step="0.01"
            />
          </Field>
          <Field label="Method">
            <select
              className={inputCls}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="">Not specified</option>
              <option value="paypal">PayPal</option>
              <option value="crypto">Crypto</option>
              <option value="wire">Wire</option>
            </select>
          </Field>
          <Field label="Reference (optional)">
            <input
              className={inputCls}
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Invoice / receipt reference"
            />
          </Field>
        </div>
        <Button onClick={handleRecord} disabled={saving}>
          {saving ? "Recording…" : "Record top-up"}
        </Button>
      </Card>

      <div>
        <h2 className="mb-3 text-base font-bold text-white">Recent top-ups</h2>
        {initial.length === 0 ? (
          <EmptyState title="No top-ups yet" body="Recorded top-ups will appear here." />
        ) : (
          <div className="overflow-x-auto overflow-hidden rounded-2xl border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Reference</th>
                </tr>
              </thead>
              <tbody>
                {initial.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white/55">{t.createdAt}</td>
                    <td className="px-4 py-3 font-medium text-white">{t.brandName}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-400">
                      {formatMoney(t.amount)}
                    </td>
                    <td className="px-4 py-3 text-white/70">
                      {t.method ? (
                        METHOD_LABELS[t.method] ?? t.method
                      ) : (
                        <span className="text-xs text-white/35">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/55">
                      {t.reference ?? <span className="text-xs text-white/35">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
