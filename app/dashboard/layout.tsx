import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { createClient } from "@/lib/supabase/server";
import { getProfile, isLive } from "@/lib/db";
import { profile as mockProfile } from "@/lib/mock";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let profile = mockProfile;
  if (isLive()) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");
    const p = await getProfile(user.id);
    if (p) {
      profile = p;
    } else {
      // Profile trigger hasn't run yet — synthesize from the auth user.
      profile = {
        ...mockProfile,
        id: user.id,
        email: user.email ?? "",
        displayName:
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          (user.email ?? "Clipper").split("@")[0],
        avatarUrl: (user.user_metadata?.avatar_url as string) ?? "",
        clipsSubmitted: 0,
      };
    }
  }
  return (
    <div className="flex min-h-screen bg-base-950">
      <div className="hidden lg:block">
        <Sidebar
          profile={{ displayName: profile.displayName, email: profile.email, avatarUrl: profile.avatarUrl }}
        />
      </div>
      <main className="min-w-0 flex-1">
        <MobileNav />
        {children}
      </main>
    </div>
  );
}
