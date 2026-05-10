import { Suspense } from "react";
import { requireAdderOrAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "./upload-form";

export const metadata = { title: "動画の登録 | ORIGAMI GRP メンバーズ" };

export default async function UploadPage() {
  await requireAdderOrAdmin();
  const supabase = await createClient();
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const categories = (rawCategories ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">🎥 新規・共有動画の登録</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          YouTube や Vimeo の共有リンクからコンテンツをデータベースに追加します
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
        <Suspense
          fallback={<p className="text-sm text-muted-foreground">読み込み中...</p>}
        >
          <UploadForm categories={categories} />
        </Suspense>
      </div>
    </div>
  );
}
