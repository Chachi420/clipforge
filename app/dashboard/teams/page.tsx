"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import Header from "@/components/Header";
import { Button, Card, EmptyState, inputCls, Field, Dialog } from "@/components/ui";

export default function TeamsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");

  return (
    <>
      <Header title="Teams" subtitle="Create a team and earn commissions" />
      <div className="px-8 py-8">
        <EmptyState
          title="No team created"
          body="Create a team to start earning commissions from referrals. Share your referral link and earn a cut of everything your team earns."
          action={<Button onClick={() => setShowCreate(true)}><Plus size={15} /> Create team</Button>}
        />
      </div>

      {showCreate && (
        <Dialog title="Create team" subtitle="Teams earn commission on referred clippers" onClose={() => setShowCreate(false)}>
          <Field label="Team name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Night Shift Clippers" />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button disabled={!name.trim()} onClick={() => { alert(`Demo mode: team "${name}" would be created.`); setShowCreate(false); }}>
              Create team
            </Button>
          </div>
        </Dialog>
      )}
    </>
  );
}
