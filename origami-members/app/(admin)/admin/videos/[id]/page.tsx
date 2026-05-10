import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditForm, type VideoEditData } from "./edit-form";

export const metadata = { title: "動画編集 | Admin" };

export default async function AdminVideoEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: video }, { data: rawCategories }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "id, title, description, video_url, thumbnail_url, target_plan, category_id, status, content_details, learning_materials, practice_checks"
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("categories")
      .select("id, name")
      .order("sort_order", { ascending: true }),
  ]);

  if (!video) notFound();

  const categories = (rawCategories ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
  }));

  const data: VideoEditData = {
    id: video.id as string,
    title: video.title as string,
    description: video.description as string | null,
    video_url: video.video_url as string,
    thumbnail_url: video.thumbnail_url as string | null,
    target_plan: (video.target_plan as string) ?? "all",
    category_id: video.category_id as string | null,
    status: (video.status as string) ?? "published",
    content_details: video.content_details as string | null,
    learning_materials: video.learning_materials as string | null,
    practice_checks: video.practice_checks as string | null,
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/admin/videos"
        className="mb-6 inline-block text-xs text-muted-foreground hover:text-primary"
      >
        ← 動画一覧へ
      </Link>

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold">🎬 動画編集</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          ID: <code className="font-mono">{data.id}</code>
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-8">
        <EditForm video={data} categories={categories} />
      </div>
    </div>
  );
}
