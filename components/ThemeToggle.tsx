"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function currentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

/** Sun/moon pill toggle. Persists to localStorage; the inline script in
 *  layout.tsx applies it before paint. */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("cf-theme", next);
    } catch {}
    setTheme(next);
  }

  if (!mounted) {
    return <span className={`inline-block h-9 w-9 rounded-full ${className}`} aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className={`glass inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition hover:text-ink md:h-9 md:w-9 ${className}`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
