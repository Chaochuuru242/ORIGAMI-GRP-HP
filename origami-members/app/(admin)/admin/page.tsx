import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata = { title: "管理ダッシュボード | Admin" };

type Metric = {
  label: string;
  value: number;
  icon: string;
  href: string;
  highlight?: boolean;
};

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: videosCount },
    { count: pendingCount },
    { count: categoriesCount },
    { count: playlistsCount },
    { count: newsCount },
    { count: teachersCount },
    { count: bookingsCount },
    { count: supportCount },
    { data: recentVideosPending },
    { data: recentSupport },
    { data: recentBookings },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("status", "published"),
    supabase
      .from("videos")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("playlists").select("id", { count: "exact", head: true }),
    supabase.from("news").select("id", { count: "exact", head: true }),
    supabase
      .from("teachers")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed")
      .gte("start_at", new Date().toISOString()),
    supabase.from("support_messages").select("id", { count: "exact", head: true }),
    supabase
      .from("videos")
      .select("id, title, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("support_messages")
      .select("id, body, created_at, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("bookings")
      .select(
        "id, start_at, status, profiles(full_name), teachers(display_name)"
      )
      .gte("start_at", new Date().toISOString())
      .eq("status", "confirmed")
      .order("start_at", { ascending: true })
      .limit(3),
  ]);

  const metrics: Metric[] = [
    {
      label: "登録ユーザー",
      value: usersCount ?? 0,
      icon: "👥",
      href: "/admin/users",
    },
    {
      label: "公開中動画",
      value: videosCount ?? 0,
      icon: "🎬",
      href: "/admin/videos",
    },
    {
      label: "承認待ち",
      value: pendingCount ?? 0,
      icon: "✅",
      href: "/admin/videos/pending",
      highlight: (pendingCount ?? 0) > 0,
    },
    {
      label: "公開講師",
      value: teachersCount ?? 0,
      icon: "🎓",
      href: "/admin/teachers",
    },
    {
      label: "予約中",
      value: bookingsCount ?? 0,
      icon: "📅",
      href: "/admin/bookings",
    },
    {
      label: "問合せ",
      value: supportCount ?? 0,
      icon: "📩",
      href: "/admin/support",
    },
    {
      label: "カテゴリ",
      value: categoriesCount ?? 0,
      icon: "🗂",
      href: "/admin/categories",
    },
    {
      label: "プレイリスト",
      value: playlistsCount ?? 0,
      icon: "📂",
      href: "/admin/playlists",
    },
    {
      label: "お知らせ",
      value: newsCount ?? 0,
      icon: "📰",
      href: "/admin/news",
    },
  ];

  const pendingVideos = recentVideosPending ?? [];
  const supportMsgs = recentSupport ?? [];
  const bookings = recentBookings ?? [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-xl font-extrabold">管理ダッシュボード</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          システム全体の状況をひと目で確認できます
        </p>
      </header>

      {/* 要対応バナー */}
      {(pendingCount ?? 0) > 0 && (
        <Link
          href="/admin/videos/pending"
          className="mb-6 flex items-center justify-between rounded-lg border-l-4 border-red-400 bg-red-50 px-4 py-3 text-sm transition hover:bg-red-100"
        >
          <span className="text-red-800">
            🚨 <strong>{pendingCount} 件</strong>の動画が承認待ちです
          </span>
          <span className="text-xs font-bold text-red-700">承認画面へ →</span>
        </Link>
      )}

      {/* メトリクス（コンパクト・3列×3行） */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          サマリー
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-3">
          {metrics.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={cn(
                "group flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition hover:border-primary/40 hover:shadow-sm",
                m.highlight && "border-red-300 bg-red-50/50"
              )}
            >
              <div>
                <p className="text-[11px] text-muted-foreground">{m.label}</p>
                <p
                  className={cn(
                    "text-xl font-extrabold",
                    m.highlight ? "text-red-600" : "text-foreground"
                  )}
                >
                  {m.value.toLocaleString()}
                </p>
              </div>
              <span className="text-2xl opacity-70 group-hover:opacity-100">
                {m.icon}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* クイックアクション */}
      <section className="mb-8">
        <h2 className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
          クイックアクション
        </h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Button
            render={<Link href="/admin/news" />}
            variant="outline"
            className="justify-start text-xs"
          >
            📰 お知らせを投稿
          </Button>
          <Button
            render={<Link href="/admin/playlists" />}
            variant="outline"
            className="justify-start text-xs"
          >
            📂 プレイリストを作成
          </Button>
          <Button
            render={<Link href="/admin/teachers" />}
            variant="outline"
            className="justify-start text-xs"
          >
            🎓 講師を登録
          </Button>
          <Button
            render={<Link href="/admin/categories" />}
            variant="outline"
            className="justify-start text-xs"
          >
            🗂 カテゴリ追加
          </Button>
        </div>
      </section>

      {/* 直近のアクティビティ */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              ✅ 動画承認待ち（直近{pendingVideos.length}件）
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {pendingVideos.length === 0 ? (
              <p className="text-muted-foreground">なし</p>
            ) : (
              <ul className="space-y-2">
                {pendingVideos.map((v) => (
                  <li key={v.id as string} className="border-b border-border pb-2 last:border-0">
                    <Link
                      href="/admin/videos/pending"
                      className="font-bold hover:text-primary"
                    >
                      {v.title as string}
                    </Link>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {new Date(v.created_at as string).toLocaleDateString(
                        "ja-JP"
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            {pendingVideos.length > 0 && (
              <Link
                href="/admin/videos/pending"
                className="mt-3 block text-[11px] text-primary hover:underline"
              >
                すべて見る →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              📅 直近の予約（{bookings.length}件）
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {bookings.length === 0 ? (
              <p className="text-muted-foreground">予定された予約なし</p>
            ) : (
              <ul className="space-y-2">
                {bookings.map((b) => {
                  const u = b.profiles as { full_name?: string } | null;
                  const t = b.teachers as { display_name?: string } | null;
                  return (
                    <li
                      key={b.id as string}
                      className="border-b border-border pb-2 last:border-0"
                    >
                      <Link
                        href={`/bookings/${b.id as string}`}
                        className="font-bold hover:text-primary"
                      >
                        {u?.full_name ?? "?"} → {t?.display_name ?? "?"}
                      </Link>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {new Date(b.start_at as string).toLocaleString(
                          "ja-JP",
                          { dateStyle: "short", timeStyle: "short" }
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href="/admin/bookings"
              className="mt-3 block text-[11px] text-primary hover:underline"
            >
              全予約一覧 →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              📩 サポート問合せ（直近{supportMsgs.length}件）
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            {supportMsgs.length === 0 ? (
              <p className="text-muted-foreground">なし</p>
            ) : (
              <ul className="space-y-2">
                {supportMsgs.map((m) => {
                  const p = m.profiles as
                    | { full_name?: string; email?: string }
                    | null;
                  return (
                    <li
                      key={m.id as string}
                      className="border-b border-border pb-2 last:border-0"
                    >
                      <p className="font-bold">{p?.full_name ?? p?.email}</p>
                      <p className="mt-0.5 line-clamp-2 text-muted-foreground">
                        {m.body as string}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">
                        {new Date(m.created_at as string).toLocaleDateString(
                          "ja-JP"
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
            <Link
              href="/admin/support"
              className="mt-3 block text-[11px] text-primary hover:underline"
            >
              全件見る →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
