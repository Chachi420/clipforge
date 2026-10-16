"use client";
import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";

/**
 * Core primitives — monochrome per brief §6.
 * Borders, not shadows. 1px lines. Radius: 6px small / 10px cards / full pills.
 * Status colors (success/warning/error) only where meaning requires it.
 */

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-line/10 bg-surface ${className}`}>{children}</div>
  );
}

/** Dark contrast card (use sparingly — hero metrics, feature panels). */
export function NightCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-white/10 bg-black text-white ${className}`}>{children}</div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "error" | "green" | "amber" | "red" | "blue" | "electric";
}) {
  const tones: Record<string, string> = {
    default: "bg-ink/[0.07] text-ink-soft",
    success: "bg-status-success/15 text-status-success",
    warning: "bg-status-warning/15 text-status-warning",
    error: "bg-status-error/12 text-status-error",
    // Legacy aliases — do not use in new code.
    green: "bg-status-success/15 text-status-success",
    amber: "bg-status-warning/15 text-status-warning",
    red: "bg-status-error/12 text-status-error",
    blue: "bg-ink/[0.07] text-ink-soft",
    electric: "bg-ink text-paper",
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
  children: ReactNode; onClick?: () => void; variant?: "primary" | "quiet" | "ghost" | "outline" | "electric" | "dark";
  className?: string; disabled?: boolean; type?: "button" | "submit";
}) {
  const variants: Record<string, string> = {
    primary: "bg-ink text-paper hover:bg-ink-soft disabled:opacity-40",
    quiet: "text-ink-soft hover:bg-ink/5 hover:text-ink",
    ghost: "text-ink-soft hover:bg-ink/5 hover:text-ink",
    outline: "border border-line/15 bg-transparent text-ink hover:bg-ink/5 disabled:opacity-40",
    electric: "bg-ink text-paper hover:bg-ink-soft disabled:opacity-40",
    dark: "bg-black text-white hover:bg-ink-soft disabled:opacity-40",
  };
  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      onClick={onClick}
      className={`pill min-h-[44px] px-5 py-2.5 text-sm font-semibold transition-colors duration-micro ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Stat({ label, value, sub, dark = false }: { label: string; value: string; sub?: string; dark?: boolean }) {
  return (
    <div>
      <div className={`text-[11px] font-semibold uppercase tracking-wider ${dark ? "text-white/50" : "text-ink-faint"}`}>{label}</div>
      <div className={`tnum mt-1 text-2xl font-bold ${dark ? "text-white" : "text-ink"}`}>{value}</div>
      {sub && <div className={`mt-0.5 text-xs ${dark ? "text-white/50" : "text-ink-faint"}`}>{sub}</div>}
    </div>
  );
}

export function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10" role="progressbar" aria-valuenow={Math.round(Math.min(100, pct))} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-ink" style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line/20 bg-surface/60 px-6 py-14 text-center">
      <div className="text-base font-semibold text-ink">{title}</div>
      <p className="mt-2 max-w-sm text-sm text-ink-faint">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Skeleton loading blocks for content (brief §6.7 — skeletons, not spinners). */
export function Skeleton({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} aria-busy="true" aria-label="Loading">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded-sm bg-ink/10" />
      ))}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`max-h-[85vh] w-full overflow-y-auto rounded-card border border-line/10 bg-paper p-6 ${wide ? "max-w-3xl" : "max-w-lg"}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            {subtitle && <p className="mt-0.5 text-sm text-ink-faint">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-ink/5 hover:text-ink" aria-label="Close dialog">
            <X size={18} aria-hidden />
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
  "w-full rounded-md border border-line/15 bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-ink-faint/70 outline-none transition-colors duration-micro focus:border-ink/40 sm:text-sm";

/** Monochrome platform marker (brief §6.1 — no hues; tonal grays only). */
export function PlatformDot({ platform }: { platform: string }) {
  const tones: Record<string, string> = {
    tiktok: "bg-ink",
    instagram: "bg-ink-soft",
    youtube: "bg-ink-faint",
    x: "bg-ink/30",
  };
  return <span title={platform} className={`inline-block h-2.5 w-2.5 rounded-full ${tones[platform] ?? "bg-ink/30"}`} />;
}
