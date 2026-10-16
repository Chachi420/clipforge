import { Card } from "./ui";
import { Eye, ShieldCheck, UserCheck, FileWarning } from "lucide-react";

const STEPS = [
  {
    icon: Eye,
    title: "Views come from the platforms, not screenshots",
    body: "YouTube view counts are pulled directly from the official YouTube Data API. Instagram views come through a third-party integration. We never accept screenshots or self-reported numbers — if we can't read it from the source, it doesn't count.",
  },
  {
    icon: UserCheck,
    title: "Every clip is reviewed by a human",
    body: "No clip earns a cent until it's approved. Our team checks that the post is real, on-brand, and follows the campaign rules before views start counting toward payouts.",
  },
  {
    icon: ShieldCheck,
    title: "Snapshots, not vibes",
    body: "We record view counts over time and pay on the verified difference — never on a single inflated number. Payouts are computed from these snapshots with open math, and brands are billed on the same figures clippers are paid on.",
  },
  {
    icon: FileWarning,
    title: "What we don't do (yet)",
    body: "We're honest about the gaps: TikTok and X view tracking isn't live yet, so clips there can't earn. Automated bot-detection is on our roadmap — today, fraud prevention is human review plus API-verified counts. We'd rather tell you what's missing than pretend it's solved.",
  },
];

export default function TrustExplainer() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
      <div className="mb-10 text-center">
        <p className="micro-label mb-3">How verification works</p>
        <h2 className="display text-3xl text-ink sm:text-4xl">
          Real views. Real money. Here&apos;s the proof.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-ink-soft">
          Everyone in clipping claims &ldquo;verified views.&rdquo; Here&apos;s
          exactly how we verify — and where we&apos;re still building.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {STEPS.map((s) => (
          <Card key={s.title} className="p-6">
            <s.icon size={22} className="text-ink" aria-hidden />
            <h3 className="mt-3 font-bold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
