import { createClient } from "@/lib/supabase/server";
import { CategoriesClient, type Category } from "./categories-client";

export const metadata = { title: "カテゴリ管理 | Admin" };

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: rawCats } = await supabase
    .from("categories")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true });

  // 各カテゴリの動画数を集計
  const { data: videos } = await supabase
    .from("videos")
    .select("category_id");
  const counts = new Map<string, number>();
  for (const v of videos ?? []) {
    if (!v.category_id) continue;
    counts.set(v.category_id as string, (counts.get(v.category_id as string) ?? 0) + 1);
  }

  const categories: Category[] = (rawCats ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
    sort_order: c.sort_order as number,
    videoCount: counts.get(c.id as string) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">🗂 カテゴリ管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          動画を分類するカテゴリを CRUD します
        </p>
      </header>
      <CategoriesClient categories={categories} />
    </div>
  );
}
