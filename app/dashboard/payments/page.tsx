import PaymentsView from "@/components/PaymentsView";
import { getUserPayouts, getUserPaymentMethods } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export default async function PaymentsRoute() {
  const user = await getSessionUser().catch(() => null);
  const userId = user?.id ?? "";
  const [cycles, methods] = await Promise.all([
    getUserPayouts(userId),
    getUserPaymentMethods(userId),
  ]);
  return <PaymentsView cycles={cycles} methods={methods} />;
}
