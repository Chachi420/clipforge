import PaymentsView from "@/components/PaymentsView";
import { paymentMethods, payoutCycles } from "@/lib/mock";

export default function PaymentsRoute() {
  return <PaymentsView cycles={payoutCycles} methods={paymentMethods} />;
}
