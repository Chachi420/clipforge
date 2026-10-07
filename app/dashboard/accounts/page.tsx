import { Plus } from "lucide-react";
import Header from "@/components/Header";
import { Badge, Button, Card, PlatformDot } from "@/components/ui";
import { PLATFORM_LABELS } from "@/lib/types";
import { socialAccounts } from "@/lib/mock";

export default function AccountsPage() {
  return (
    <>
      <Header title="Accounts" subtitle="Manage your connected social accounts" />
      <div className="px-8 py-8">
        <div className="mb-6 flex justify-end">
          <Button><Plus size={15} /> Add account</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {socialAccounts.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold">
                  <PlatformDot platform={a.platform} /> {PLATFORM_LABELS[a.platform]}
                </span>
                <Badge tone={a.verified ? "green" : "amber"}>{a.verified ? "Verified" : "Pending"}</Badge>
              </div>
              <div className="mt-3 font-mono text-sm text-white/70">{a.handle}</div>
              <div className="mt-4 flex gap-2">
                <button className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs font-medium text-white/70 hover:bg-white/10">Edit handle</button>
                <button className="flex-1 rounded-lg bg-white/5 py-1.5 text-xs font-medium text-red-300/80 hover:bg-white/10">Remove</button>
              </div>
            </Card>
          ))}
        </div>
        <p className="mt-6 text-xs text-white/35">
          Accounts must be verified before clips posted from them count toward payouts.
        </p>
      </div>
    </>
  );
}
