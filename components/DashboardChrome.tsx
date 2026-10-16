"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { SidebarNav, type SidebarProfile } from "./Sidebar";

type MenuState = {
  open: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  menuButtonRef: { current: HTMLButtonElement | null };
};

const MenuContext = createContext<MenuState>({
  open: false,
  openMenu: () => {},
  closeMenu: () => {},
  menuButtonRef: { current: null },
});

/** Access the dashboard drawer menu state (Header's hamburger uses this). */
export function useDashboardMenu() {
  return useContext(MenuContext);
}

/**
 * Dashboard chrome: desktop sidebar (240px, same bg as content + 1px right
 * border) and a mobile overlay drawer. Provides the menu context for the
 * header hamburger.
 */
export function DashboardShell({
  profile,
  children,
}: {
  profile: SidebarProfile;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const wasOpenRef = useRef(false);

  const openMenu = useCallback(() => setOpen(true), []);
  const closeMenu = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      // Return focus to the hamburger that opened the drawer (not on first mount).
      if (wasOpenRef.current) menuButtonRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;
    // Slide the panel in after mount for the transition to play.
    const raf = requestAnimationFrame(() => setEntered(true));
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      // Focus trap: keep Tab cycling inside the dialog.
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open ]);

  return (
    <MenuContext.Provider value={{ open, openMenu, closeMenu, menuButtonRef }}>
      <div className="flex min-h-screen bg-paper">
        <aside className="hidden w-60 shrink-0 border-r border-line/10 bg-paper lg:block">
          <div className="sticky top-0 h-screen">
            <SidebarNav profile={profile} />
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>

      {open && (
        <div
          ref={dialogRef}
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Dashboard menu"
        >
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={closeMenu}
            aria-hidden
          />
          <div
            className={`absolute left-0 top-0 flex h-full w-72 flex-col border-r border-line/10 bg-paper transition-transform duration-[250ms] ease-out motion-reduce:transition-none ${
              entered ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex items-center justify-end border-b border-line/10 px-2 py-1">
              <button
                ref={closeRef}
                onClick={closeMenu}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-md text-ink hover:bg-ink/5"
              >
                <X size={20} aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <SidebarNav profile={profile} onNavigate={closeMenu} />
            </div>
          </div>
        </div>
      )}
    </MenuContext.Provider>
  );
}
