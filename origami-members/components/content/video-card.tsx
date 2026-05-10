import Link from "next/link";
import { getThumbnailUrl } from "@/lib/video/embed";
import type { TargetPlan } from "@/lib/plan/constants";

export type VideoCardProps = {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  targetPlan: TargetPlan;
  createdAt: string;
  isViewable: boolean;
};

const PLAN_LABELS: Record<TargetPlan, string> = {
  all: "全プラン共通",
  light: "ライト以上",
  standard: "スタンダード以上",
  premium: "プレミアム専用",
};

export function VideoCard({
  id,
  title,
  videoUrl,
  thumbnailUrl,
  targetPlan,
  createdAt,
  isViewable,
}: VideoCardProps) {
  const thumb = thumbnailUrl ?? getThumbnailUrl(videoUrl);
  const dateStr = new Date(createdAt).toLocaleDateString("ja-JP");

  const card = (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-zinc-900">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={title}
            className={
              isViewable
                ? "h-full w-full object-cover transition group-hover:scale-105"
                : "h-full w-full object-cover blur-[2px] grayscale"
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl text-white/60">
            ▶️
          </div>
        )}

        {!isViewable && (
          <>
            <div className="absolute inset-0 bg-zinc-700/40 backdrop-blur-sm" />
            <div className="absolute inset-0 flex items-center justify-center text-5xl drop-shadow-lg">
              🔒
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <span
          className={
            isViewable
              ? "mb-2 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700"
              : "mb-2 inline-block rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-muted-foreground"
          }
        >
          {isViewable ? "視聴可能" : "限定公開"}
        </span>
        <h4 className="text-sm font-bold leading-snug">
          {!isViewable && "🔒 "}
          {title}
        </h4>
        <p className="mt-1 text-xs text-muted-foreground">
          {dateStr} | {PLAN_LABELS[targetPlan]}
        </p>
      </div>
    </div>
  );

  if (isViewable) {
    return (
      <Link href={`/contents/${id}`} className="block">
        {card}
      </Link>
    );
  }
  return (
    <Link href="/account/billing" className="block" title="プランをアップグレード">
      {card}
    </Link>
  );
}
