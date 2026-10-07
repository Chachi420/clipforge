"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { Badge, Button, Card, inputCls } from "@/components/ui";
import { signOutAction, updateProfile } from "@/lib/actions";
import { AUTH_PROVIDER_LABELS, type ClipperProfile } from "@/lib/types";

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

export default function SettingsView({ profile }: { profile: ClipperProfile }) {
  const [publicProfile, setPublicProfile] = useState(profile.publicProfile);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function save(next?: { publicProfile?: boolean }) {
    setSaving(true);
    setError(null);
    try {
      await updateProfile({
        displayName,
        bio,
        publicProfile: next?.publicProfile ?? publicProfile,
      });
      setEditing(false);
      router.refresh();
    } catch (e: any) {
      setError(e.message ?? "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublic() {
    const next = !publicProfile;
    setPublicProfile(next);
    await save({ publicProfile: next });
  }

  return (
    <>
      <Header title="Settings" subtitle="Manage your profile and preferences" />
      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent-soft">
                {displayName.slice(0, 1)}
              </span>
            )}
            <div>
              <div className="text-lg font-bold">{displayName}</div>
              <div className="flex items-center gap-2 text-sm text-white/45">
                <Badge tone="green">{profile.status}</Badge>
                <span>Joined {profile.joinedAt}</span>
                <span>·</span>
                <span>{AUTH_PROVIDER_LABELS[profile.provider]} login</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-bold">Profile</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium">Display name</div>
                {editing ? (
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`${inputCls} mt-1 max-w-xs`}
                  />
                ) : (
                  <div className="text-sm text-white/55">{displayName}</div>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium">About</div>
              {editing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder="Tell others about yourself…"
                  className={`${inputCls} mt-1`}
                />
              ) : (
                <div className="text-sm text-white/45">
                  {profile.bio || "No bio yet. Add one to tell others about yourself."}
                </div>
              )}
            </div>
            {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            <div className="flex justify-end gap-2">
              {editing && (
                <Button variant="ghost" onClick={() => { setEditing(false); setDisplayName(profile.displayName); setBio(profile.bio ?? ""); }}>
                  Cancel
                </Button>
              )}
              <Button variant="outline" onClick={() => (editing ? save() : setEditing(true))} disabled={saving}>
                {saving ? "Saving…" : editing ? "Save" : "Edit"}
              </Button>
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
              onClick={togglePublic}
              className={`relative h-7 w-12 rounded-full transition ${publicProfile ? "bg-accent" : "bg-white/15"}`}
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${publicProfile ? "left-6" : "left-1"}`} />
            </button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 font-bold">Account info</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-white/45">Email</dt><dd className="text-white/75">{profile.email}</dd></div>
            <div className="flex justify-between"><dt className="text-white/45">Auth provider</dt><dd className="text-white/75">{AUTH_PROVIDER_LABELS[profile.provider]}</dd></div>
          </dl>
        </Card>

        <Card className="p-6">
          <h3 className="mb-1 font-bold">Clip activity</h3>
          <p className="mb-4 text-sm text-white/45">Last 12 months</p>
          <div className="mb-5 grid grid-cols-1 gap-4 text-sm sm:grid-cols-3">
            <div><div className="text-xl font-bold">{profile.clipsSubmitted.toLocaleString()}</div><div className="text-white/45">Clips submitted</div></div>
            <div><div className="text-xl font-bold">{profile.avgClipsPerDay}</div><div className="text-white/45">Avg clips / day</div></div>
            <div><div className="text-xl font-bold">{profile.activeDays}</div><div className="text-white/45">Active days</div></div>
          </div>
          <Heatmap />
        </Card>

        <div className="flex justify-end">
          <form action={signOutAction}>
            <Button variant="outline" type="submit">Sign out</Button>
          </form>
        </div>
      </div>
    </>
  );
}
