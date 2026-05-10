import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompleteProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { canViewContent } from "@/lib/plan/permissions";
import { getThumbnailUrl } from "@/lib/video/embed";
import type { TargetPlan } from "@/lib/plan/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "プレイリスト詳細 | ORIGAMI GRP メンバーズ" };

const PLAN_LABELS: Record<TargetPlan, string> = {
  all: "全プラン共通",
  light: "ライト以上",
  standard: "スタンダード以上",
  premium: "プレミアム専用",
};

export default async function PlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireCompleteProfile();
  const supabase = await createClient();

  const { data: playlist } = await supabase
    .from("playlists")
    .select("id, title, description, thumbnail_url, target_plan")
    .eq("id", id)
    .single();

  if (!playlist) notFound();

  const playlistTargetPlan = ((playlist.target_plan ?? "all") as string)
    .trim()
    .toLowerCase() as TargetPlan;

  const playlistViewable = canViewContent({
    userPlan: profile.plan,
    userRole: profile.role,
    targetPlan: playlistTargetPlan,
  });

  if (!playlistViewable) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary-light/30 p-10 text-center">
          <h1 className="mb-3 text-xl font-extrabold text-primary">🔒 視聴制限</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            このプレイリストは <strong>{playlistTargetPlan}</strong>{" "}
            プラン以上で視聴可能です。
          </p>
          <div className="flex justify-center gap-3">
            <Button render={<Link href="/account/billing" />}>
              プランをアップグレード
            </Button>
            <Button render={<Link href="/playlists" />} variant="outline">
              一覧に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 動画リスト（並び順付き）
  const { data: pvJoin } = await supabase
    .from("playlist_videos")
    .select("position, video_id, videos(id, title, video_url, thumbnail_url, target_plan, status, created_at)")
    .eq("playlist_id", id)
    .order("position", { ascending: true });

  const items =
    (pvJoin ?? [])
      .map((row) => {
        const v = row.videos as unknown as {
          id: string;
          title: string;
          video_url: string;
          thumbnail_url: string | null;
          target_plan: string;
          status: string;
          created_at: string;
        } | null;
        if (!v || v.status !== "published") return null;
        const tp = (v.target_plan ?? "all").trim().toLowerCase() as TargetPlan;
        return {
          id: v.id,
          title: v.title,
          videoUrl: v.video_url,
          thumbnailUrl: v.thumbnail_url,
          targetPlan: tp,
          isViewable: canViewContent({
            userPlan: profile.plan,
            userRole: profile.role,
            targetPlan: tp,
          }),
          position: row.position as number,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null) ?? [];

  // 自分の視聴履歴
  const { data: views } = await supabase
    .from("video_views")
    .select("video_id");
  const watched = new Set((views ?? []).map((v) => v.video_id as string));

  const watchedCount = items.filter((i) => watched.has(i.id)).length;
  const percent = items.length
    ? Math.round((watchedCount / items.length) * 100)
    : 0;

  const firstUnwatched = items.find((i) => !watched.has(i.id) && i.isViewable);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/playlists"
        className="mb-6 inline-block text-xs text-muted-foreground hover:text-primary"
      >
        ← プレイリスト一覧へ
      </Link>

      <header className="mb-8 grid gap-6 md:grid-cols-[1fr_2fr]">
        <div className="aspect-video overflow-hidden rounded-xl bg-zinc-800">
          {playlist.thumbnail_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={playlist.thumbnail_url as string}
              alt={playlist.title as string}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl text-white/50">
              📂
            </div>
          )}
        </div>

        <div>
          <Badge variant="outline" className="mb-2">
            {PLAN_LABELS[playlistTargetPlan]}
          </Badge>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            {playlist.title as string}
          </h1>
          {playlist.description && (
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              {playlist.description as string}
            </p>
          )}

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                進捗 {watchedCount}/{items.length}
              </span>
              <span className="font-bold text-primary">{percent}%</span>
            </div>
            <Progress value={percent} className="h-2" />
          </div>

          {firstUnwatched && (
            <Button
              render={<Link href={`/contents/${firstUnwatched.id}`} />}
              className="mt-5"
            >
              ▶️ 続きから視聴する
            </Button>
          )}
        </div>
      </header>

      <section>
        <h2 className="mb-4 text-base font-extrabold">動画リスト</h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
            このプレイリストにはまだ動画が登録されていません。
          </div>
        ) : (
          <ol className="space-y-2">
            {items.map((item, idx) => {
              const isWatched = watched.has(item.id);
              const thumb = item.thumbnailUrl ?? getThumbnailUrl(item.videoUrl);
              return (
                <li key={item.id}>
                  <Link
                    href={
                      item.isViewable
                        ? `/contents/${item.id}`
                        : "/account/billing"
                    }
                    className="group flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition hover:border-primary/40 hover:shadow-sm"
                  >
                    <span className="w-6 shrink-0 text-center text-xs font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <div className="aspect-video w-32 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={thumb}
                          alt={item.title}
                          className={
                            item.isViewable
                              ? "h-full w-full object-cover"
                              : "h-full w-full object-cover grayscale"
                          }
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-2xl text-white/60">
                          ▶️
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">
                        {!item.isViewable && "🔒 "}
                        {item.title}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {PLAN_LABELS[item.targetPlan]}
                      </p>
                    </div>
                    {item.isViewable && isWatched && (
                      <Badge
                        variant="outline"
                        className="border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        ✓ 視聴済
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
