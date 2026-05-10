import Link from "next/link";
import { requireCompleteProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { canViewContent } from "@/lib/plan/permissions";
import { PLAN_NAMES, type TargetPlan } from "@/lib/plan/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const metadata = { title: "ダッシュボード | ORIGAMI GRP メンバーズ" };

function getRankBadgeClass(plan: string): string {
  switch (plan) {
    case "premium":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "standard":
      return "bg-amber-50 text-amber-600 border-amber-100";
    case "light":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getYouTubeThumbUrl(videoUrl: string | null): string | null {
  if (!videoUrl) return null;
  if (videoUrl.includes("youtube.com/watch?v=")) {
    try {
      const vid = new URL(videoUrl).searchParams.get("v");
      return vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null;
    } catch {
      return null;
    }
  }
  if (videoUrl.includes("youtu.be/")) {
    const vid = videoUrl.split("youtu.be/")[1]?.split("?")[0];
    return vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null;
  }
  return null;
}

export default async function DashboardPage() {
  const { profile } = await requireCompleteProfile();
  const supabase = await createClient();

  // 視聴可能動画一覧（公開済）
  const { data: allVideos } = await supabase
    .from("videos")
    .select("id, title, target_plan, video_url, thumbnail_url, created_at")
    .eq("status", "published");

  const watchableVideos = (allVideos ?? []).filter((v) =>
    canViewContent({
      userPlan: profile.plan,
      userRole: profile.role,
      targetPlan: (v.target_plan ?? "all") as TargetPlan,
    })
  );

  // 視聴履歴
  const { data: views } = await supabase
    .from("video_views")
    .select("video_id");

  const watchedIds = new Set((views ?? []).map((v) => v.video_id));
  const totalCount = watchableVideos.length;
  const watchedCount = watchableVideos.filter((v) =>
    watchedIds.has(v.id)
  ).length;
  const percent =
    totalCount > 0 ? Math.round((watchedCount / totalCount) * 100) : 0;

  // 最新お知らせ 3件
  const { data: news } = await supabase
    .from("news")
    .select("id, title, published_at, created_at")
    .order("created_at", { ascending: false })
    .limit(3);

  // おすすめ動画（自分のプランで視聴可能な最新2件）
  const featured = watchableVideos
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 2);

  const userName = profile.full_name ?? "メンバー";
  const planLabel = PLAN_NAMES[profile.plan] ?? "無料会員";

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">
            お帰りなさい、{userName} 様
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            現在のステータス：
            <Badge
              variant="outline"
              className={`ml-2 ${getRankBadgeClass(profile.plan)}`}
            >
              {profile.role === "admin"
                ? "管理者"
                : profile.role === "adder"
                ? "コンテンツ追加者"
                : profile.role === "teacher"
                ? "講師"
                : planLabel}
            </Badge>
          </p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* 学習進捗 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📈 学習の進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                全動画 {totalCount}本中 {watchedCount}本視聴済み
              </span>
              <span className="font-bold text-primary">{percent}%</span>
            </div>
            <Progress value={percent} className="mb-4 h-2" />
            <Button
              render={<Link href="/contents" />}
              size="sm"
              variant="outline"
              className="w-full"
            >
              学習を再開する →
            </Button>
          </CardContent>
        </Card>

        {/* お知らせ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🔔 お知らせ</CardTitle>
          </CardHeader>
          <CardContent>
            {news && news.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {news.map((n, i) => {
                  const date = new Date(
                    n.published_at ?? n.created_at
                  ).toLocaleDateString("ja-JP");
                  return (
                    <li
                      key={n.id}
                      className={
                        i < news.length - 1
                          ? "border-b border-border pb-3"
                          : ""
                      }
                    >
                      <span className="block text-[11px] text-muted-foreground">
                        {date}
                      </span>
                      <span className="text-sm">{n.title}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-xs text-muted-foreground">
                現在お知らせはありません
              </p>
            )}
          </CardContent>
        </Card>

        {/* クイックアクセス */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🚀 クイックアクセス</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button
              render={<Link href="/contents" />}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              最新動画
            </Button>
            <Button
              render={<Link href="/teachers" />}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              講師相談
            </Button>
            <Button
              render={<Link href="/account/billing" />}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              プラン変更
            </Button>
            <Button
              render={<Link href="/profile" />}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              登録情報
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* おすすめ動画 */}
      <section className="mt-12">
        <h2 className="mb-5 text-lg font-extrabold">おすすめのコンテンツ</h2>
        {featured.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v) => {
              const thumb = v.thumbnail_url ?? getYouTubeThumbUrl(v.video_url);
              return (
                <Link
                  href={`/contents/${v.id}`}
                  key={v.id}
                  className="group overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-zinc-900">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={v.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-3xl text-white/60">
                        ▶️
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h4 className="text-sm font-bold leading-snug">
                      {v.title}
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      対象プラン: {v.target_plan}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              現在視聴可能なコンテンツがありません。
              <br />
              プランをアップグレードすると、より多くの動画が解放されます。
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
