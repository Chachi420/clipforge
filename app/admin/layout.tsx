import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(email.toLowerCase());
}

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/campaigns", label: "Campaigns" },
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/payouts", label: "Payouts" },
  { href: "/admin/billing", label: "Billing" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!isAdminEmail(user?.email)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-paper">
      <header className="glass sticky top-0 z-40 border-b border-line/10 px-4 py-3 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-full bg-lime px-3 py-1 text-sm font-bold text-ink">
              Admin
            </span>
            <nav className="flex gap-1 overflow-x-auto">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="shrink-0 rounded-full px-3 py-1.5 text-sm font-medium text-ink-soft transition hover:bg-ink/5 hover:text-ink"
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
