import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlaylistCreateForm } from "./playlist-create-form";

export const metadata = { title: "プレイリスト管理 | Admin" };

const PLAN_LABELS: Record<string, string> = {
  all: "全プラン共通",
  light: "ライト以上",
  standard: "スタンダード以上",
  premium: "プレミアム専用",
};

export default async function AdminPlaylistsPage() {
  const supabase = await createClient();

  const { data: rawPlaylists } = await supabase
    .from("playlists")
    .select("id, title, target_plan, sort_order")
    .order("sort_order", { ascending: true });

  const { data: rawPv } = await supabase
    .from("playlist_videos")
    .select("playlist_id");

  const counts = new Map<string, number>();
  for (const pv of rawPv ?? []) {
    const id = pv.playlist_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const playlists = (rawPlaylists ?? []).map((p) => ({
    id: p.id as string,
    title: p.title as string,
    target_plan: (p.target_plan as string) ?? "all",
    sort_order: p.sort_order as number,
    videoCount: counts.get(p.id as string) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">📂 プレイリスト管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          動画をまとめたコース構成を作成・編集します
        </p>
      </header>

      <section className="mb-10 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-extrabold">新規プレイリスト作成</h2>
        <PlaylistCreateForm />
      </section>

      <section>
        <h2 className="mb-4 text-base font-extrabold">
          既存プレイリスト ({playlists.length}件)
        </h2>
        {playlists.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
            まだプレイリストがありません。上のフォームから作成してください。
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                    タイトル
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                    対象プラン
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                    動画数
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                    並び
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {playlists.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 font-bold">{p.title}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {PLAN_LABELS[p.target_plan]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {p.videoCount}本
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {p.sort_order}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        render={<Link href={`/admin/playlists/${p.id}`} />}
                        size="sm"
                        variant="outline"
                      >
                        編集 →
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
