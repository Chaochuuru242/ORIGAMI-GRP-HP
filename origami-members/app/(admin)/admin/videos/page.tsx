import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "動画一覧 | Admin" };

const PLAN_LABELS: Record<string, string> = {
  all: "全プラン共通",
  light: "ライト以上",
  standard: "スタンダード以上",
  premium: "プレミアム専用",
};

export default async function AdminVideosListPage() {
  const supabase = await createClient();
  const { data: rawVideos } = await supabase
    .from("videos")
    .select(
      "id, title, target_plan, status, created_at, video_url, categories(name)"
    )
    .order("created_at", { ascending: false });

  const videos = rawVideos ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">🎬 動画一覧</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            公開中・承認待ちの全動画一覧 ({videos.length}本)
          </p>
        </div>
        <Button render={<Link href="/admin/videos/pending" />}>
          承認待ち一覧 →
        </Button>
      </header>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                公開日
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                タイトル
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                プラン
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                カテゴリ
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                状態
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                URL
              </th>
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  動画がまだ登録されていません
                </td>
              </tr>
            ) : (
              videos.map((v) => {
                const cat = (v.categories as { name?: string } | null)?.name;
                const status = v.status as string;
                return (
                  <tr
                    key={v.id as string}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(v.created_at as string).toLocaleDateString(
                        "ja-JP"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/contents/${v.id as string}`}
                        className="font-bold hover:text-primary"
                      >
                        {v.title as string}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">
                        {PLAN_LABELS[(v.target_plan as string) ?? "all"]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {cat ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          status === "published"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {status === "published" ? "公開中" : "承認待ち"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={v.video_url as string}
                        target="_blank"
                        className="text-xs text-primary underline"
                      >
                        ↗ 開く
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
