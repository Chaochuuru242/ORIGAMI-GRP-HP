"use client";

import { useState, useMemo } from "react";
import { CategoryFilter, type Category } from "@/components/content/category-filter";
import { VideoCard } from "@/components/content/video-card";
import type { TargetPlan } from "@/lib/plan/constants";

export type Video = {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string | null;
  target_plan: TargetPlan;
  category_id: string | null;
  created_at: string;
  isViewable: boolean;
};

const SECTIONS: {
  id: string;
  title: string;
  plans: TargetPlan[];
  badgeColor: string;
}[] = [
  {
    id: "basic",
    title: "🌱 全プラン共通コンテンツ",
    plans: ["all"],
    badgeColor: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  {
    id: "light",
    title: "⚡ ライトコース以上",
    plans: ["light"],
    badgeColor: "border-sky-200 bg-sky-50 text-sky-700",
  },
  {
    id: "standard",
    title: "🏢 スタンダードコース以上",
    plans: ["standard"],
    badgeColor: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },
  {
    id: "premium",
    title: "👑 プレミアム専用",
    plans: ["premium"],
    badgeColor: "border-amber-200 bg-amber-50 text-amber-700",
  },
];

export function ContentsClient({
  videos,
  categories,
}: {
  videos: Video[];
  categories: Category[];
}) {
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!activeCategoryId) return videos;
    return videos.filter((v) => v.category_id === activeCategoryId);
  }, [videos, activeCategoryId]);

  const sections = SECTIONS.map((sec) => ({
    ...sec,
    videos: filtered.filter((v) => sec.plans.includes(v.target_plan)),
  })).filter((sec) => sec.videos.length > 0);

  return (
    <>
      <CategoryFilter
        categories={categories}
        activeId={activeCategoryId}
        onChange={setActiveCategoryId}
      />

      {sections.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-16 text-center text-sm text-muted-foreground">
          このカテゴリには動画がまだありません。
        </div>
      ) : (
        sections.map((sec) => (
          <section key={sec.id} className="mb-12">
            <div className="mb-5 flex items-center gap-3 border-b-2 border-primary/20 pb-3">
              <h2 className="text-base font-extrabold text-primary">
                {sec.title}
              </h2>
              <span
                className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${sec.badgeColor}`}
              >
                {sec.videos.length}本
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sec.videos.map((v) => (
                <VideoCard
                  key={v.id}
                  id={v.id}
                  title={v.title}
                  videoUrl={v.video_url}
                  thumbnailUrl={v.thumbnail_url}
                  targetPlan={v.target_plan}
                  createdAt={v.created_at}
                  isViewable={v.isViewable}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}
