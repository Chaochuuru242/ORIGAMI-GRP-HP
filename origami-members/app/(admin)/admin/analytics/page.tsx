import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "分析 | Admin" };

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();

  const [{ data: recentViews }, { data: recentDownloads }] = await Promise.all([
    supabase
      .from("video_views")
      .select(
        "created_at, profiles(full_name, email), videos(title)"
      )
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("video_downloads")
      .select(
        "created_at, material_type, profiles(full_name, email), videos(title)"
      )
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const views = recentViews ?? [];
  const downloads = recentDownloads ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">📈 分析</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          視聴・ダウンロードの最新ログ（直近50件）
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          ※ ユーザー絞り込み・期間指定・サマリー集計は Phase 7 で拡充予定
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">▶️ 動画視聴履歴 ({views.length})</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto">
            {views.length === 0 ? (
              <p className="text-xs text-muted-foreground">視聴履歴がまだありません</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {views.map((v, i) => {
                  const p = v.profiles as { full_name?: string; email?: string } | null;
                  const vid = v.videos as { title?: string } | null;
                  return (
                    <li key={i} className="border-b border-border pb-2">
                      <div className="text-muted-foreground">
                        {new Date(v.created_at as string).toLocaleString("ja-JP")}
                      </div>
                      <div className="font-bold">
                        {p?.full_name ?? p?.email ?? "(削除済み)"}
                      </div>
                      <div className="text-muted-foreground">
                        🎬 {vid?.title ?? "(削除済み)"}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">📥 資料DL履歴 ({downloads.length})</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto">
            {downloads.length === 0 ? (
              <p className="text-xs text-muted-foreground">DL履歴がまだありません</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {downloads.map((d, i) => {
                  const p = d.profiles as { full_name?: string; email?: string } | null;
                  const vid = d.videos as { title?: string } | null;
                  return (
                    <li key={i} className="border-b border-border pb-2">
                      <div className="text-muted-foreground">
                        {new Date(d.created_at as string).toLocaleString("ja-JP")}
                      </div>
                      <div className="font-bold">
                        {p?.full_name ?? p?.email ?? "(削除済み)"}
                      </div>
                      <div className="text-muted-foreground">
                        📄 {vid?.title ?? "(削除済み)"} (
                        {d.material_type as string})
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
