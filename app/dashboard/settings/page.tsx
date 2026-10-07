import { redirect } from "next/navigation";
import SettingsView from "@/components/SettingsView";
import { getProfile } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { profile as mockProfile } from "@/lib/mock";

export default async function SettingsRoute() {
  const user = await getSessionUser().catch(() => null);
  if (!user) redirect("/login");
  const profile = (await getProfile(user.id)) ?? {
    ...mockProfile,
    id: user.id,
    email: user.email ?? "",
  };
  return <SettingsView profile={profile} />;
}
