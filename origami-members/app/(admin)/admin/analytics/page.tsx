import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "分析 | Admin" };

const PERIOD_OPTIONS = [
  { value: "7", label: "直近7日" },
  { value: "30", label: "直近30日" },
  { value: "90", label: "直近90日" },
  { value: "all", label: "全期間" },
];

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; days?: string }>;
}) {
  const { user, days } = await searchParams;
  const period = days ?? "30";

  const supabase = await createClient();

  const { data: rawProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("created_at", { ascending: false });
  const profileList = rawProfiles ?? [];

  const sinceDate =
    period === "all"
      ? null
      : new Date(Date.now() - Number(period) * 24 * 60 * 60 * 1000).toISOString();

  let viewsQuery = supabase
    .from("video_views")
    .select(
      "created_at, user_id, video_id, profiles(full_name, email), videos(title)"
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (sinceDate) viewsQuery = viewsQuery.gte("created_at", sinceDate);
  if (user) viewsQuery = viewsQuery.eq("user_id", user);

  let downloadsQuery = supabase
    .from("video_downloads")
    .select(
      "created_at, user_id, material_type, profiles(full_name, email), videos(title)"
    )
    .order("created_at", { ascending: false })
    .limit(200);
  if (sinceDate) downloadsQuery = downloadsQuery.gte("created_at", sinceDate);
  if (user) downloadsQuery = downloadsQuery.eq("user_id", user);

  const [{ data: views }, { data: downloads }] = await Promise.all([
    viewsQuery,
    downloadsQuery,
  ]);

  // サマリー：ユニークユーザー数・人気動画 Top5
  const uniqueViewers = new Set((views ?? []).map((v) => v.user_id as string)).size;
  const videoCount = new Map<string, { title: string; count: number }>();
  for (const v of views ?? []) {
    const id = v.video_id as string;
    const title = (v.videos as { title?: string } | null)?.title ?? "(削除)";
    const cur = videoCount.get(id) ?? { title, count: 0 };
    cur.count += 1;
    videoCount.set(id, cur);
  }
  const topVideos = Array.from(videoCount.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold">📈 分析</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          視聴・ダウンロードの履歴と集計
        </p>
      </header>

      <form
        method="GET"
        className="mb-8 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[2fr_1fr_auto]"
      >
        <select
          name="user"
          defaultValue={user ?? ""}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="">すべてのユーザー</option>
          {profileList.map((p) => (
            <option key={p.id as string} value={p.id as string}>
              {(p.full_name as string) ?? "(未設定)"} — {p.email as string}
            </option>
          ))}
        </select>
        <select
          name="days"
          defaultValue={period}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          {PERIOD_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          🔍 集計
        </Button>
      </form>

      {/* サマリー */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">視聴件数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-primary">
              {(views ?? []).length}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                件
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">ユニーク視聴者</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-primary">
              {uniqueViewers}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                人
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">資料DL件数</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-primary">
              {(downloads ?? []).length}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                件
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 人気動画 Top5 */}
      {topVideos.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm">🔥 人気動画 Top 5（視聴数）</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-sm">
              {topVideos.map((v, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between border-b border-border pb-2 last:border-0 last:pb-0"
                >
                  <span>
                    <span className="mr-2 font-bold text-primary">{i + 1}.</span>
                    {v.title}
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">
                    {v.count}回
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              ▶️ 動画視聴履歴 ({(views ?? []).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto">
            {!views || views.length === 0 ? (
              <p className="text-xs text-muted-foreground">該当データなし</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {views.map((v, i) => {
                  const p = v.profiles as
                    | { full_name?: string; email?: string }
                    | null;
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
            <CardTitle className="text-base">
              📥 資料DL履歴 ({(downloads ?? []).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[60vh] overflow-y-auto">
            {!downloads || downloads.length === 0 ? (
              <p className="text-xs text-muted-foreground">該当データなし</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {downloads.map((d, i) => {
                  const p = d.profiles as
                    | { full_name?: string; email?: string }
                    | null;
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
