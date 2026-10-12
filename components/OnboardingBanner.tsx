"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { Card } from "./ui";

const STORAGE_KEY = "clipforge-onboarding-dismissed";

export default function OnboardingBanner({
  hasConnectedAccount,
  hasVerifiedAccount,
  hasJoinedCampaign,
  hasClips,
  uploadHref,
}: {
  hasConnectedAccount: boolean;
  hasVerifiedAccount: boolean;
  hasJoinedCampaign: boolean;
  hasClips: boolean;
  uploadHref: string;
}) {
  // Start hidden so dismissed users never see a flash before hydration.
  const [dismissed, setDismissed] = useState(true);
  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
  };

  if (dismissed) return null;

  const steps = [
    {
      title: "Connect your accounts",
      desc: "Link your TikTok, Reels, Shorts, or X account.",
      href: "/dashboard/accounts",
      done: hasConnectedAccount,
    },
    {
      title: "Verify with your bio code",
      desc: "Add your unique code to your bio so we can confirm it's you.",
      href: "/dashboard/accounts",
      done: hasVerifiedAccount,
    },
    {
      title: "Pick a campaign",
      desc: "Browse campaigns and join one that fits your audience.",
      href: "/dashboard/campaigns",
      done: hasJoinedCampaign,
    },
    {
      title: "Submit your first clip",
      desc: "Post a clip, then paste the link here.",
      href: uploadHref,
      done: hasClips,
    },
  ];

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-ink">Get started</h2>
          <p className="mt-1 text-sm text-ink-faint">
            Four steps before your clips can start earning.
          </p>
        </div>
        <button
          onClick={dismiss}
          aria-label="Dismiss onboarding checklist"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-faint transition hover:bg-ink/5 hover:text-ink"
        >
          <X size={16} />
        </button>
      </div>
      <ol className="mt-4 space-y-1">
        {steps.map((s, i) => (
          <li key={s.title}>
            <Link
              href={s.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-ink/5 ${
                s.done ? "opacity-60" : ""
              }`}
              aria-label={`${s.title}${s.done ? " (done)" : ""}`}
            >
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  s.done ? "bg-status-success/15 text-status-success" : "bg-ink/[0.07] text-ink-soft"
                }`}
                aria-hidden="true"
              >
                {s.done ? <Check size={13} /> : i + 1}
              </span>
              <span>
                <span className="block text-sm font-medium text-ink">
                  {s.title}
                  {s.done && <span className="sr-only"> (done)</span>}
                </span>
                <span className="block text-xs text-ink-faint">{s.desc}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
