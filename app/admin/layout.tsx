import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

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
  { href: "/admin/verifications", label: "Verifications" },
  { href: "/admin/payouts", label: "Payouts" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!isAdminEmail(user?.email)) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-base-950">
      <header className="border-b border-white/10 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="rounded-lg bg-accent/15 px-2.5 py-1 text-sm font-bold text-accent-soft">
              Admin
            </span>
            <nav className="flex gap-1">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link href="/dashboard" className="text-sm text-white/60 hover:text-white">
            ← Back to dashboard
          </Link>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
