import { createClient } from "@/lib/supabase/server";
import { NewsClient, type NewsItem } from "./news-client";

export const metadata = { title: "お知らせ管理 | Admin" };

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: rawNews } = await supabase
    .from("news")
    .select("id, title, body, published_at, created_at")
    .order("created_at", { ascending: false });

  const items: NewsItem[] = (rawNews ?? []).map((n) => ({
    id: n.id as string,
    title: n.title as string,
    body: n.body as string | null,
    published_at: n.published_at as string | null,
    created_at: n.created_at as string,
  }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">📰 お知らせ管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ユーザーのダッシュボードに表示されるお知らせを管理します
        </p>
      </header>
      <NewsClient items={items} />
    </div>
  );
}
