import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getThumbnailUrl } from "@/lib/video/embed";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  updatePlaylistAction,
  deletePlaylistAction,
  addVideoToPlaylistAction,
  removeVideoFromPlaylistAction,
  updateVideoPositionAction,
} from "../actions";

export const metadata = { title: "プレイリスト編集 | Admin" };

const PLAN_LABELS: Record<string, string> = {
  all: "全プラン共通",
  light: "ライト以上",
  standard: "スタンダード以上",
  premium: "プレミアム専用",
};

export default async function AdminPlaylistEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: playlist } = await supabase
    .from("playlists")
    .select("id, title, description, thumbnail_url, target_plan, sort_order")
    .eq("id", id)
    .single();

  if (!playlist) notFound();

  const { data: pvJoin } = await supabase
    .from("playlist_videos")
    .select(
      "position, video_id, videos(id, title, video_url, thumbnail_url, target_plan, status)"
    )
    .eq("playlist_id", id)
    .order("position", { ascending: true });

  const items = (pvJoin ?? []).map((row) => {
    const v = row.videos as unknown as {
      id: string;
      title: string;
      video_url: string;
      thumbnail_url: string | null;
      target_plan: string;
      status: string;
    } | null;
    return {
      videoId: (row.video_id as string) ?? null,
      position: row.position as number,
      title: v?.title ?? "(削除済み)",
      videoUrl: v?.video_url ?? "",
      thumbnailUrl: v?.thumbnail_url ?? null,
      targetPlan: (v?.target_plan ?? "all") as string,
      status: v?.status ?? "unknown",
    };
  });

  const includedIds = new Set(
    items.map((i) => i.videoId).filter((x): x is string => x !== null)
  );

  // 追加候補：published かつ未追加の動画
  const { data: candidates } = await supabase
    .from("videos")
    .select("id, title, target_plan, video_url, thumbnail_url, categories(name)")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(100);

  const candidateList = (candidates ?? []).filter(
    (c) => !includedIds.has(c.id as string)
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/admin/playlists"
        className="mb-6 inline-block text-xs text-muted-foreground hover:text-primary"
      >
        ← プレイリスト一覧へ
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">📂 プレイリスト編集</h1>
      </header>

      {/* メタ情報編集 */}
      <section className="mb-8 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-extrabold">基本情報</h2>
        <form action={updatePlaylistAction} className="space-y-4">
          <input type="hidden" name="id" value={playlist.id as string} />
          <div className="space-y-1">
            <Label className="text-xs">タイトル</Label>
            <Input
              name="title"
              defaultValue={playlist.title as string}
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">対象プラン</Label>
              <select
                name="target_plan"
                defaultValue={(playlist.target_plan as string) ?? "all"}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="all">全プラン共通</option>
                <option value="light">ライト以上</option>
                <option value="standard">スタンダード以上</option>
                <option value="premium">プレミアム専用</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">並び順</Label>
              <Input
                name="sort_order"
                type="number"
                defaultValue={playlist.sort_order as number}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">説明</Label>
            <textarea
              name="description"
              defaultValue={(playlist.description as string) ?? ""}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">サムネイル URL</Label>
            <Input
              name="thumbnail_url"
              type="url"
              defaultValue={(playlist.thumbnail_url as string) ?? ""}
            />
          </div>
          <div className="flex justify-between">
            <Button type="submit">保存</Button>
            <form action={deletePlaylistAction}>
              <input type="hidden" name="id" value={playlist.id as string} />
              <Button type="submit" variant="destructive">
                プレイリストを削除
              </Button>
            </form>
          </div>
        </form>
      </section>

      {/* 含まれる動画 */}
      <section className="mb-8">
        <h2 className="mb-4 text-base font-extrabold">
          含まれる動画 ({items.length}本)
        </h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
            まだ動画が追加されていません。下から追加してください。
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => {
              const thumb = it.thumbnailUrl ?? getThumbnailUrl(it.videoUrl);
              return (
                <div
                  key={it.videoId ?? Math.random().toString()}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={it.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl text-white/60">
                        ▶️
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{it.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {PLAN_LABELS[it.targetPlan]}
                    </p>
                  </div>
                  <form action={updateVideoPositionAction}>
                    <input type="hidden" name="playlist_id" value={id} />
                    <input
                      type="hidden"
                      name="video_id"
                      value={it.videoId ?? ""}
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        name="position"
                        type="number"
                        defaultValue={it.position}
                        className="h-8 w-20 text-xs"
                      />
                      <Button type="submit" size="sm" variant="outline">
                        順番更新
                      </Button>
                    </div>
                  </form>
                  <form action={removeVideoFromPlaylistAction}>
                    <input type="hidden" name="playlist_id" value={id} />
                    <input
                      type="hidden"
                      name="video_id"
                      value={it.videoId ?? ""}
                    />
                    <Button type="submit" size="sm" variant="destructive">
                      除外
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 追加候補 */}
      <section>
        <h2 className="mb-4 text-base font-extrabold">
          追加できる動画 ({candidateList.length}本)
        </h2>
        {candidateList.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-8 text-center text-sm text-muted-foreground">
            追加可能な動画がありません（公開済みの全動画が既に追加されています）
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {candidateList.map((c) => {
              const thumb =
                (c.thumbnail_url as string | null) ??
                getThumbnailUrl(c.video_url as string);
              const cat = (c.categories as { name?: string } | null)?.name;
              return (
                <div
                  key={c.id as string}
                  className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                >
                  <div className="aspect-video w-20 shrink-0 overflow-hidden rounded bg-zinc-800">
                    {thumb && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={c.title as string}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">
                      {c.title as string}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1">
                      <Badge variant="outline" className="text-[10px]">
                        {PLAN_LABELS[(c.target_plan as string) ?? "all"]}
                      </Badge>
                      {cat && (
                        <Badge variant="outline" className="text-[10px]">
                          {cat}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <form action={addVideoToPlaylistAction}>
                    <input type="hidden" name="playlist_id" value={id} />
                    <input
                      type="hidden"
                      name="video_id"
                      value={c.id as string}
                    />
                    <Button type="submit" size="sm">
                      ＋追加
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
