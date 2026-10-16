import { redirect } from "next/navigation";
import { headers } from "next/headers";
import BrandSidebar from "@/components/BrandSidebar";
import BrandMobileNav from "@/components/BrandMobileNav";
import { requireBrand } from "@/lib/brand-actions";
import { isLive } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Brand shell: hard role separation. Only profiles.role='brand' get in;
 * everyone else is sent to the clipper dashboard. In demo mode (no Supabase)
 * renders a demo brand shell so `next build` stays green.
 * The login page renders bare (no shell, no guard).
 */
export default async function BrandLayout({ children }: { children: React.ReactNode }) {
  const pathname = headers().get("x-pathname");
  // Login and request-access pages render bare (no shell, no guard).
  if (pathname === "/brand/login" || pathname === "/brand/request") {
    return <>{children}</>;
  }

  if (!isLive()) {
    return (
      <div className="flex min-h-screen bg-paper">
        <div className="hidden lg:block">
          <BrandSidebar
            brand={{ name: "Your brand", contactEmail: "brand@example.com", logoUrl: "" }}
          />
        </div>
        <main className="min-w-0 flex-1">
          <BrandMobileNav />
          {children}
        </main>
      </div>
    );
  }

  let brand: { name: string; contactEmail: string; logoUrl: string };
  try {
    ({ brand } = await Promise.race([
      requireBrand(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("brand layout timeout")), 8000)
      ),
    ]));
  } catch (e) {
    // requireBrand redirects on auth failure; anything else → dashboard.
    // Timeout (dead session) → brand login.
    if (e instanceof Error && e.message.includes("NEXT_REDIRECT")) throw e;
    if (e instanceof Error && e.message.includes("timeout")) {
      redirect("/brand/login?next=/brand/request");
    }
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-paper">
      <div className="hidden lg:block">
        <BrandSidebar brand={brand} />
      </div>
      <main className="min-w-0 flex-1">
        <BrandMobileNav />
        {children}
      </main>
    </div>
  );
}
