"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Globe } from "lucide-react";
import { Badge, Button, EmptyState } from "@/components/ui";
import {
  approveBrandRequest,
  rejectBrandRequest,
  type PendingBrandRequest,
} from "@/lib/admin-actions";

const BUDGET_LABELS: Record<string, string> = {
  under_1k: "Under $1k/mo",
  "1k_5k": "$1k–$5k/mo",
  "5k_25k": "$5k–$25k/mo",
  "25k_plus": "$25k+/mo",
};

export default function BrandRequestQueue({ initial }: { initial: PendingBrandRequest[] }) {
  const [items, setItems] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function act(id: string, fn: (id: string) => Promise<void>) {
    setBusy(id);
    setError(null);
    try {
      await fn(id);
      setItems((xs) => xs.filter((x) => x.id !== id));
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Action failed.");
    } finally {
      setBusy(null);
    }
  }

  if (items.length === 0) {
    return <EmptyState title="No pending requests" body="New brand access requests will appear here." />;
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-400">{error}</p>}
      {items.map((r) => (
        <div key={r.id} className="rounded-2xl border border-white/10 bg-base-850 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-white">{r.companyName}</h3>
                <Badge>{BUDGET_LABELS[r.budgetRange] ?? r.budgetRange}</Badge>
              </div>
              <p className="mt-1 text-sm text-white/55">
                {r.contactName} · {r.email}
              </p>
              {r.website && (
                <a
                  href={r.website.startsWith("http") ? r.website : `https://${r.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-xs text-accent-soft hover:underline"
                >
                  <Globe size={12} /> {r.website}
                </a>
              )}
              {r.message && (
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/60">{r.message}</p>
              )}
              <p className="mt-2 text-xs text-white/30">
                Requested {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={busy === r.id}
                onClick={() => act(r.id, approveBrandRequest)}
                className="inline-flex items-center gap-1.5"
              >
                <Check size={15} /> {busy === r.id ? "…" : "Approve"}
              </Button>
              <Button
                variant="outline"
                disabled={busy === r.id}
                onClick={() => {
                  if (window.confirm(`Reject the request from "${r.companyName}"?`)) act(r.id, rejectBrandRequest);
                }}
                className="inline-flex items-center gap-1.5"
              >
                <X size={15} /> Reject
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
