"use client";
import { useState } from "react";
import Header from "@/components/Header";
import { Badge, Button, Card } from "@/components/ui";
import { profile } from "@/lib/mock";

function Heatmap() {
  const weeks = Array.from({ length: 52 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const seed = (w * 7 + d * 13) % 11;
      return seed > 8 ? 4 : seed > 6 ? 3 : seed > 4 ? 2 : seed > 2 ? 1 : 0;
    })
  );
  const shades = ["bg-white/5", "bg-accent/25", "bg-accent/50", "bg-accent/75", "bg-accent"];
  return (
    <div>
      <div className="flex gap-[3px]">
        {weeks.map((days, w) => (
          <div key={w} className="flex flex-col gap-[3px]">
            {days.map((v, d) => (
              <span key={d} title={`${v} clips`} className={`h-2.5 w-2.5 rounded-[3px] ${shades[v]}`} />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-white/40">
        Less {shades.map((s, i) => <span key={i} className={`h-2.5 w-2.5 rounded-[3px] ${s}`} />)} More
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [publicProfile, setPublicProfile] = useState(profile.publicProfile);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [editing, setEditing] = useState(false);

  return (
    <>
      <Header title="Settings" subtitle="Manage your profile and preferences" />
      <div className="space-y-6 px-8 py-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent-soft">
              {displayName.slice(0, 1)}
            </span>
            <div>
              <div className="text-lg font-bold">{displayName}</div>
              <div className="flex items-center gap-2 text-sm text-white/45">
                <Badge tone="green">{profile.status}</Badge>
                <span>Joined {profile.joinedAt}</span>
                <span>·</span>
                <span>Discord OAuth</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-bold">Profile</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Display name</div>
                {editing ? (
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="mt-1 rounded-lg border border-white/10 bg-base-900 px-3 py-1.5 text-sm outline-none focus:border-accent/60"
                  />
                ) : (
                  <div className="text-sm text-white/55">{displayName}</div>
                )}
              </div>
              <Button variant="outline" onClick={() => setEditing(!editing)}>{editing ? "Save" : "Edit"}</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">About</div>
                <div className="text-sm text-white/45">No bio yet. Add one to tell others about yourself.</div>
              </div>
              <Button variant="outline">Add</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-bold">Public profile</h3>
          <div className="flex items-center justify-between">
            <p className="max-w-md text-sm text-white/55">
              {publicProfile
                ? "Your profile is public. Anyone with the link can see it."
                : "Only you can see your profile. Turn on to share a public link."}
            </p>
            <button
              role="switch"
              aria-checked={publicProfile}
              onClick={() => setPublicProfile(!publicProfile)}
              className={`relative h-7 w-12 rounded-full transition ${publicProfile ? "bg-accent" : "bg-white/15"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${publicProfile ? "left-6" : "left-1"}`} />
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-bold">Account info</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-white/45">Discord ID</dt><dd className="font-mono text-white/75">{profile.discordId}</dd></div>
            <div className="flex justify-between"><dt className="text-white/45">Email</dt><dd className="text-white/75">{profile.email}</dd></div>
            <div className="flex justify-between"><dt className="text-white/45">Auth provider</dt><dd className="text-white/75">Discord OAuth</dd></div>
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="mb-1 font-bold">Clip activity</h3>
          <p className="mb-4 text-sm text-white/45">Last 12 months</p>
          <div className="mb-5 grid grid-cols-3 gap-4 text-sm">
            <div><div className="text-xl font-bold">{profile.clipsSubmitted.toLocaleString()}</div><div className="text-white/45">Clips submitted</div></div>
            <div><div className="text-xl font-bold">{profile.avgClipsPerDay}</div><div className="text-white/45">Avg clips / day</div></div>
            <div><div className="text-xl font-bold">{profile.activeDays}</div><div className="text-white/45">Active days</div></div>
          </div>
          <Heatmap />
        </Card>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => alert("Demo mode: sign-out would clear the session.")}>Sign out</Button>
        </div>
      </div>
    </>
  );
}
