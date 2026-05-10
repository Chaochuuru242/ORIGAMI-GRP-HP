import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { TargetPlan } from "@/lib/plan/constants";

const PLAN_LABELS: Record<TargetPlan, string> = {
  all: "全プラン共通",
  light: "ライト以上",
  standard: "スタンダード以上",
  premium: "プレミアム専用",
};

export type PlaylistCardProps = {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  targetPlan: TargetPlan;
  videoCount: number;
  watchedCount: number;
  isViewable: boolean;
};

export function PlaylistCard(props: PlaylistCardProps) {
  const {
    id,
    title,
    description,
    thumbnailUrl,
    targetPlan,
    videoCount,
    watchedCount,
    isViewable,
  } = props;
  const percent =
    videoCount > 0 ? Math.round((watchedCount / videoCount) * 100) : 0;

  return (
    <Link
      href={isViewable ? `/playlists/${id}` : "/account/billing"}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition hover:shadow-md"
    >
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={title}
            className={
              isViewable
                ? "h-full w-full object-cover transition group-hover:scale-105"
                : "h-full w-full object-cover blur-[2px] grayscale"
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl text-white/60">
            📂
          </div>
        )}
        {!isViewable && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-700/40 backdrop-blur-sm text-5xl">
            🔒
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge variant="secondary">{videoCount}本</Badge>
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-1 text-sm font-bold leading-snug">
          {!isViewable && "🔒 "}
          {title}
        </h3>
        {description && (
          <p className="mb-3 line-clamp-2 text-xs text-muted-foreground">
            {description}
          </p>
        )}
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">
            {PLAN_LABELS[targetPlan]}
          </span>
          {isViewable && videoCount > 0 && (
            <span className="font-bold text-primary">
              {watchedCount}/{videoCount} ({percent}%)
            </span>
          )}
        </div>
        {isViewable && videoCount > 0 && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}
