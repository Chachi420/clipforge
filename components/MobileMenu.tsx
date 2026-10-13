"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "/clip", label: "Clippers" },
  { href: "/brands", label: "Brands" },
  { href: "/blog", label: "Blog" },
  { href: "/docs", label: "Docs" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Mobile nav — full-screen overlay menu (brief §9.2).
 * Large display-type links, quiet Sign in, full-width CTA at the bottom.
 * Escape closes, focus is trapped, body scroll is locked, 44px+ targets.
 */
export default function MobileMenu({
  signInHref = "/login",
  signInLabel = "Sign in",
  ctaHref = "/login",
  ctaLabel = "Start clipping",
}: {
  signInHref?: string;
  signInLabel?: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Scroll lock while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape to close + focus trap + initial focus
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a[href]")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (e.key === "Tab" && panel) {
        const els = Array.from(
          panel.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")
        );
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open ]);

  return (
    <div className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-menu-overlay"
        className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
      >
        <Menu size={22} aria-hidden />
      </button>

      {open &&
        createPortal(
          <div
            id="mobile-menu-overlay"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-[60] flex flex-col bg-white dark:bg-black"
          >
          <div className="flex items-center justify-between px-5 py-3">
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              CLIPFORGE
            </span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              aria-label="Close menu"
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5"
            >
              <X size={22} aria-hidden />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex flex-1 flex-col px-6 pt-6">
            {LINKS.map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-[64px] items-center border-b border-line/[0.08] font-display text-4xl font-medium tracking-tight transition-colors ${
                    active ? "text-ink underline decoration-[2px] underline-offset-8" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            <Link
              href={signInHref}
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex min-h-[44px] items-center text-base font-semibold text-ink-soft hover:text-ink"
            >
              {signInLabel}
            </Link>

            <div className="mt-auto pb-8 pt-6">
              <Link
                href={ctaHref}
                onClick={() => setOpen(false)}
                className="pill btn-liquid min-h-[52px] w-full bg-ink text-base font-semibold text-paper transition-colors hover:bg-ink-soft"
              >
                {ctaLabel}
              </Link>
            </div>
          </nav>
          </div>,
          document.body
        )}
    </div>
  );
}
