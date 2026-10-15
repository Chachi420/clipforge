import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import { isAdminUser } from "@/lib/admin";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/clips", label: "Clips" },
  { href: "/admin/clippers", label: "Clippers" },
  { href: "/admin/brands", label: "Brands" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/requests", label: "Requests" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/audit", label: "Activity" },
];

/**
 * Admin chrome — internal ops tool. Top-tab pattern kept (brief §9.6),
 * reskinned to the token system: monochrome, text tabs with underline
 * active state, same type scale and borders as the rest of the product.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  // Admin = the single authorized Google account only (see lib/admin.ts).
  if (!isAdminUser(user)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-paper">
      <header className="sticky top-0 z-40 border-b border-line/10 bg-paper">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <span className="shrink-0 rounded-md bg-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-paper">
              Admin
            </span>
            <nav className="flex gap-1 overflow-x-auto" aria-label="Admin">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="shrink-0 px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard" className="text-sm font-medium text-ink-soft hover:text-ink">
              ← Back to dashboard
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
