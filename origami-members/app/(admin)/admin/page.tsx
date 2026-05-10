import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "管理ダッシュボード | ORIGAMI GRP メンバーズ" };

export default async function AdminHomePage() {
  const supabase = await createClient();

  const [
    { count: usersCount },
    { count: videosCount },
    { count: pendingCount },
    { count: categoriesCount },
    { count: playlistsCount },
    { count: newsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("videos").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("videos").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("categories").select("id", { count: "exact", head: true }),
    supabase.from("playlists").select("id", { count: "exact", head: true }),
    supabase.from("news").select("id", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "登録ユーザー", count: usersCount ?? 0, href: "/admin/users", icon: "👥" },
    { label: "公開中の動画", count: videosCount ?? 0, href: "/admin/videos", icon: "🎬" },
    { label: "承認待ち動画", count: pendingCount ?? 0, href: "/admin/videos/pending", icon: "✅", highlight: (pendingCount ?? 0) > 0 },
    { label: "カテゴリ", count: categoriesCount ?? 0, href: "/admin/categories", icon: "🗂" },
    { label: "プレイリスト", count: playlistsCount ?? 0, href: "/admin/playlists", icon: "📂" },
    { label: "お知らせ", count: newsCount ?? 0, href: "/admin/news", icon: "📰" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">管理ダッシュボード</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          システム全体の状況を確認できます
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Link key={s.href} href={s.href} className="group">
            <Card
              className={
                s.highlight
                  ? "border-red-300 bg-red-50/50 transition group-hover:border-red-400 group-hover:shadow-md"
                  : "transition group-hover:border-primary/40 group-hover:shadow-md"
              }
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {s.label}
                </CardTitle>
                <span className="text-2xl">{s.icon}</span>
              </CardHeader>
              <CardContent>
                <span
                  className={
                    s.highlight
                      ? "text-3xl font-extrabold text-red-600"
                      : "text-3xl font-extrabold text-foreground"
                  }
                >
                  {s.count.toLocaleString()}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
