import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { MarketingFooter } from "@/components/marketing";

export default function PoliciesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <nav className="border-b border-line/10" aria-label="Policies">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-display text-xl font-bold tracking-tight">
            WONDEED
          </Link>
          <ThemeToggle />
        </div>
      </nav>
      <main className="mx-auto max-w-3xl px-6 py-14">{children}</main>
      <MarketingFooter />
    </div>
  );
}
