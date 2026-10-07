"use client";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-base-850 ${className}`}>{children}</div>
  );
}

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "green" | "amber" | "red" | "blue" }) {
  const tones: Record<string, string> = {
    default: "bg-white/10 text-white/70",
    green: "bg-emerald-500/15 text-emerald-400",
    amber: "bg-amber-500/15 text-amber-400",
    red: "bg-red-500/15 text-red-400",
    blue: "bg-sky-500/15 text-sky-400",
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
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "outline";
  className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const variants: Record<string, string> = {
    primary: "bg-accent text-white hover:bg-accent-soft disabled:opacity-40",
    ghost: "text-white/70 hover:bg-white/5",
    outline: "border border-white/15 text-white/80 hover:bg-white/5 disabled:opacity-40",
  };
  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{label}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-white/40">{sub}</div>}
    </div>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 px-6 py-14 text-center">
      <div className="text-base font-semibold text-white">{title}</div>
      <p className="mt-2 max-w-sm text-sm text-white/50">{body}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className={`max-h-[85vh] w-full overflow-y-auto rounded-2xl border border-white/10 bg-base-850 p-6 ${wide ? "max-w-3xl" : "max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-white/50">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close">
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
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border border-white/10 bg-base-900 px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-accent/60";

export function PlatformDot({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    tiktok: "bg-cyan-400", instagram: "bg-pink-500", youtube: "bg-red-500", x: "bg-white",
  };
  return <span title={platform} className={`inline-block h-2.5 w-2.5 rounded-full ${colors[platform] ?? "bg-white/30"}`} />;
}
