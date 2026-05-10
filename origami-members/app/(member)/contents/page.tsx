import { requireCompleteProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { canViewContent } from "@/lib/plan/permissions";
import type { TargetPlan } from "@/lib/plan/constants";
import { ContentsClient, type Video } from "./contents-client";

export const metadata = { title: "コンテンツ一覧 | ORIGAMI GRP メンバーズ" };

export default async function ContentsPage() {
  const { profile } = await requireCompleteProfile();
  const supabase = await createClient();

  const [{ data: rawVideos }, { data: rawCategories }] = await Promise.all([
    supabase
      .from("videos")
      .select(
        "id, title, video_url, thumbnail_url, target_plan, category_id, created_at"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false }),
    supabase
      .from("categories")
      .select("id, name, slug")
      .order("sort_order", { ascending: true }),
  ]);

  const videos: Video[] = (rawVideos ?? []).map((v) => ({
    id: v.id as string,
    title: v.title as string,
    video_url: v.video_url as string,
    thumbnail_url: v.thumbnail_url as string | null,
    target_plan: ((v.target_plan ?? "all") as string).trim().toLowerCase() as TargetPlan,
    category_id: v.category_id as string | null,
    created_at: v.created_at as string,
    isViewable: canViewContent({
      userPlan: profile.plan,
      userRole: profile.role,
      targetPlan: ((v.target_plan ?? "all") as string).trim().toLowerCase() as TargetPlan,
    }),
  }));

  const categories = (rawCategories ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    slug: c.slug as string,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">コンテンツライブラリ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          実践で使える AI ノウハウを体系的に。最新動画は毎週更新。
        </p>
      </header>

      <ContentsClient videos={videos} categories={categories} />
    </div>
  );
}
