import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompleteProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { canViewContent } from "@/lib/plan/permissions";
import type { TargetPlan } from "@/lib/plan/constants";
import { getEmbedUrl } from "@/lib/video/embed";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "./video-player";

export const metadata = { title: "動画詳細 | ORIGAMI GRP メンバーズ" };

/**
 * 既存DBに保存された動画の説明文には、改行が `\n` というリテラル2文字で
 * 入っているケースがある（旧 upload フローで textarea の値がエスケープされて保存）。
 * 表示時に実際の改行コードに変換する。
 */
function normalizeLineBreaks(text: string): string {
  return text.replace(/\\n/g, "\n").replace(/\\r/g, "");
}

export default async function ContentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireCompleteProfile();
  const supabase = await createClient();

  const { data: video, error } = await supabase
    .from("videos")
    .select(
      "id, title, description, video_url, target_plan, content_details, learning_materials, practice_checks, created_at, category_id"
    )
    .eq("id", id)
    .eq("status", "published")
    .single();

  if (error || !video) {
    notFound();
  }

  const targetPlan = ((video.target_plan ?? "all") as string)
    .trim()
    .toLowerCase() as TargetPlan;

  const isViewable = canViewContent({
    userPlan: profile.plan,
    userRole: profile.role,
    targetPlan,
  });

  if (!isViewable) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary-light/30 p-10 text-center">
          <h1 className="mb-3 text-xl font-extrabold text-primary">🔒 視聴制限</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            この動画を視聴するには、<strong>{targetPlan}</strong> プラン以上の
            <br />
            メンバーシップが必要です。
          </p>
          <div className="flex justify-center gap-3">
            <Button render={<Link href="/account/billing" />}>
              プランをアップグレードする
            </Button>
            <Button
              render={<Link href="/contents" />}
              variant="outline"
            >
              一覧に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(video.video_url as string);
  const dateStr = new Date(video.created_at as string).toLocaleDateString(
    "ja-JP"
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Link
        href="/contents"
        className="mb-6 inline-block text-xs text-muted-foreground hover:text-primary"
      >
        ← コンテンツ一覧へ
      </Link>

      <header className="mb-6">
        <h1 className="mb-3 text-2xl font-extrabold sm:text-3xl">
          {video.title as string}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>{dateStr} 公開</span>
          <Badge variant="outline">対象プラン: {targetPlan}</Badge>
        </div>
      </header>

      {embedUrl ? (
        <VideoPlayer
          videoId={video.id as string}
          embedUrl={embedUrl}
          learningMaterialUrl={video.learning_materials as string | null}
          practiceCheckUrl={video.practice_checks as string | null}
        />
      ) : (
        <div className="aspect-video rounded-xl bg-muted p-10 text-center text-sm text-muted-foreground">
          動画 URL を埋め込み形式に変換できませんでした。
          <br />
          管理者に動画 URL の確認を依頼してください。
        </div>
      )}

      {video.description && (
        <section className="mt-10">
          <h2 className="mb-3 text-base font-extrabold">概要</h2>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {normalizeLineBreaks(video.description as string)}
          </p>
        </section>
      )}

      {video.content_details && (
        <section className="mt-8">
          <h2 className="mb-3 text-base font-extrabold">講義内容</h2>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {normalizeLineBreaks(video.content_details as string)}
          </p>
        </section>
      )}
    </div>
  );
}
