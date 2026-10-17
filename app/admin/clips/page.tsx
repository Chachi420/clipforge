import Link from "next/link";
import { getAdminClips } from "@/lib/admin-actions";
import ClipReviewQueue from "@/components/admin/ClipReviewQueue";

export const dynamic = "force-dynamic";

const FILTERS = [
  { key: "pending_review", label: "Awaiting review" },
  { key: "tracking", label: "Tracking" },
  { key: "flagged", label: "Flagged" },
  { key: "not_tracking", label: "Rejected" },
  { key: "all", label: "All clips" },
];

export default async function AdminClipsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = FILTERS.some((f) => f.key === status) ? status! : "pending_review";

  let clips: Awaited<ReturnType<typeof getAdminClips>> = [];
  let loadError: string | null = null;
  try {
    clips = await getAdminClips(filter);
  } catch (e: any) {
    loadError = e?.message ?? "Could not load clips.";
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
      <div>
        <h1 className="display text-3xl">Clips</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Every clip waits here until you approve it. {clips.length} clip{clips.length === 1 ? "" : "s"} in this view.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/clips?status=${f.key}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.key
                ? "border-ink bg-ink text-paper"
                : "border-line/10 text-ink-soft hover:border-ink/40 hover:text-ink"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>
      {loadError ? (
        <div className="rounded-md border border-status-error/30 bg-status-error/10 px-4 py-3 text-sm text-status-error">
          Could not load clips: {loadError}
        </div>
      ) : (
        <ClipReviewQueue initial={clips} />
      )}
    </div>
  );
}
