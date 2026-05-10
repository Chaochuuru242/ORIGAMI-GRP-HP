import { requireCompleteProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { canViewContent } from "@/lib/plan/permissions";
import type { TargetPlan } from "@/lib/plan/constants";
import { PlaylistCard } from "@/components/content/playlist-card";

export const metadata = { title: "プレイリスト | ORIGAMI GRP メンバーズ" };

type RawPlaylist = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  target_plan: string;
  sort_order: number;
};

export default async function PlaylistsPage() {
  const { profile } = await requireCompleteProfile();
  const supabase = await createClient();

  const { data: rawPlaylists } = await supabase
    .from("playlists")
    .select("id, title, description, thumbnail_url, target_plan, sort_order")
    .order("sort_order", { ascending: true });

  const playlists = (rawPlaylists ?? []) as RawPlaylist[];

  const playlistIds = playlists.map((p) => p.id);

  // 各プレイリストの動画数を集計
  const { data: pvAll } = await supabase
    .from("playlist_videos")
    .select("playlist_id, video_id");

  // 自分の視聴履歴
  const { data: viewsAll } = await supabase
    .from("video_views")
    .select("video_id");

  const watchedSet = new Set((viewsAll ?? []).map((v) => v.video_id as string));

  const stats = new Map<
    string,
    { videoCount: number; watchedCount: number }
  >();
  for (const p of playlists) {
    stats.set(p.id, { videoCount: 0, watchedCount: 0 });
  }
  for (const pv of pvAll ?? []) {
    const stat = stats.get(pv.playlist_id as string);
    if (!stat) continue;
    stat.videoCount += 1;
    if (watchedSet.has(pv.video_id as string)) stat.watchedCount += 1;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">📂 学習プレイリスト</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          目的別にまとめられたコース。順番に視聴して体系的に学習できます。
        </p>
      </header>

      {playlists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-sm text-muted-foreground">
          現在、公開中のプレイリストはありません。
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {playlists
            .filter((p) => playlistIds.includes(p.id))
            .map((p) => {
              const targetPlan = (p.target_plan ?? "all")
                .trim()
                .toLowerCase() as TargetPlan;
              const isViewable = canViewContent({
                userPlan: profile.plan,
                userRole: profile.role,
                targetPlan,
              });
              const stat = stats.get(p.id) ?? {
                videoCount: 0,
                watchedCount: 0,
              };
              return (
                <PlaylistCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  description={p.description}
                  thumbnailUrl={p.thumbnail_url}
                  targetPlan={targetPlan}
                  videoCount={stat.videoCount}
                  watchedCount={stat.watchedCount}
                  isViewable={isViewable}
                />
              );
            })}
        </div>
      )}
    </div>
  );
}
