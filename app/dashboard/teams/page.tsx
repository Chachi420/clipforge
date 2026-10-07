import TeamsView from "@/components/TeamsView";
import { getUserTeams } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export default async function TeamsRoute() {
  const user = await getSessionUser().catch(() => null);
  const teams = await getUserTeams(user?.id ?? "");
  return <TeamsView initial={teams} />;
}
