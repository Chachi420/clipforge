"use client";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass glass-sheen rounded-3xl ${className}`}>{children}</div>
  );
}

/** Dark contrast card with lime glow (use sparingly — hero metrics, feature panels). */
export function NightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-dark glass-sheen glow-lime rounded-3xl text-white ${className}`}>{children}</div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "green" | "amber" | "red" | "blue" | "lime" }) {
  const tones: Record<string, string> = {
    default: "bg-ink/8 text-ink-soft",
    green: "bg-emerald-500/15 text-emerald-700",
    amber: "bg-amber-500/15 text-amber-700",
    red: "bg-red-500/12 text-red-600",
    blue: "bg-sky-500/12 text-sky-700",
    lime: "bg-lime text-ink",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Button({
  children, onClick, variant = "primary", className = "", disabled, type,
}: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "outline" | "lime" | "dark";
  className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const variants: Record<string, string> = {
    primary: "bg-ink text-white hover:bg-ink-soft disabled:opacity-40 shadow-card",
    lime: "bg-lime text-ink hover:bg-lime-soft disabled:opacity-40 shadow-card",
    dark: "bg-night text-white hover:bg-ink-soft disabled:opacity-40",
    ghost: "text-ink-soft hover:bg-ink/5",
    outline: "border border-ink/15 text-ink hover:bg-ink/5 disabled:opacity-40 bg-white/50 backdrop-blur",
  };
  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      onClick={onClick}
      className={`pill px-5 py-2.5 text-sm ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, sub, dark = false }: { label: string; value: string; sub?: string; dark?: boolean }) {
  return (
    <div>
      <div className={`text-[11px] font-semibold uppercase tracking-wider ${dark ? "text-white/50" : "text-ink-faint"}`}>{label}</div>
      <div className={`mt-1 text-2xl font-bold ${dark ? "text-white" : "text-ink"}`}>{value}</div>
      {sub && <div className={`mt-0.5 text-xs ${dark ? "text-white/50" : "text-ink-faint"}`}>{sub}</div>}
    </div>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
      <div className="h-full rounded-full bg-lime-deep" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-ink/15 bg-white/40 px-6 py-14 text-center backdrop-blur">
      <div className="text-base font-semibold text-ink">{title}</div>
      <p className="mt-2 max-w-sm text-sm text-ink-faint">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Dialog({ title, subtitle, onClose, children, wide }: {
  title: string; subtitle?: string; onClose: () => void; children: ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`glass glass-sheen max-h-[85vh] w-full overflow-y-auto rounded-3xl p-6 ${wide ? "max-w-3xl" : "max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-faint">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-faint hover:bg-ink/5 hover:text-ink" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-ink-faint">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-2xl border border-line/15 bg-surface/70 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint/70 outline-none backdrop-blur focus:border-lime-deep/50 focus:ring-2 focus:ring-lime/40";

export function PlatformDot({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    tiktok: "bg-cyan-500", instagram: "bg-pink-500", youtube: "bg-red-500", x: "bg-ink",
  };
  return <span title={platform} className={`inline-block h-2.5 w-2.5 rounded-full ${colors[platform] ?? "bg-ink/30"}`} />;
}
