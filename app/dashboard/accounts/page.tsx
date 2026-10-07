import AccountsView from "@/components/AccountsView";
import { getUserSocialAccounts } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export default async function AccountsRoute() {
  const user = await getSessionUser().catch(() => null);
  const accounts = await getUserSocialAccounts(user?.id ?? "");
  return <AccountsView initial={accounts} />;
}
