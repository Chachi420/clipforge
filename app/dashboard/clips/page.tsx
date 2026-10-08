import Header from "@/components/Header";
import { ClipTable } from "@/components/ClipTable";
import { Card, NightCard, Stat } from "@/components/ui";
import { getUserClips } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { formatCompact } from "@/lib/format";

export default async function ClipsPage() {
  const user = await getSessionUser().catch(() => null);
  const clips = await getUserClips(user?.id ?? "");
  const totalViews = clips.reduce((s, c) => s + c.views, 0);
  const engagement = clips.reduce((s, c) => s + c.likes + c.comments, 0);

  return (
    <>
      <Header title="Clips" subtitle="Manage your clips and track performance" />
      <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <NightCard className="p-5">
            <Stat dark label="Total views" value={formatCompact(totalViews)} sub="Across all platforms" />
          </NightCard>
          <Card className="p-5">
            <Stat label="Total clips" value={formatCompact(clips.length)} sub="All your content" />
          </Card>
          <Card className="p-5">
            <Stat label="Engagement" value={formatCompact(engagement)} sub="Likes + comments" />
          </Card>
        </div>
        <div>
          <h2 className="display mb-4 text-lg">Your clips</h2>
          <ClipTable clips={clips} />
        </div>
      </div>
    </>
  );
}
