import { redirect } from "next/navigation";
import SettingsView from "@/components/SettingsView";
import { getClipActivity, getProfile } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { profile as mockProfile } from "@/lib/mock";

export default async function SettingsRoute() {
  const user = await getSessionUser().catch(() => null);
  if (!user) redirect("/login");
  const [profile, activity] = await Promise.all([
    getProfile(user.id),
    getClipActivity(user.id),
  ]);
  return (
    <SettingsView
      profile={
        profile ?? { ...mockProfile, id: user.id, email: user.email ?? "" }
      }
      activity={activity.counts}
    />
  );
}
