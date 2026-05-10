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

const ROLE_LABEL: Record<string, string> = {
  admin: "ORIGAMI GRP 公式",
  adder: "コンテンツ追加担当",
  teacher: "講師",
  user: "メンバー",
};

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
      "id, title, description, video_url, target_plan, content_details, learning_materials, practice_checks, created_at, category_id, created_by, categories(name)"
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
            <Button render={<Link href="/contents" />} variant="outline">
              一覧に戻る
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 投稿者情報を取得（profiles + teachers を created_by で参照）
  const createdById = video.created_by as string | null;
  let publisher: {
    id: string;
    name: string;
    photoUrl: string | null;
    role: string;
    isTeacher: boolean;
  } | null = null;

  if (createdById) {
    const { data: pub } = await supabase
      .from("profiles")
      .select("id, full_name, role, teachers(display_name, photo_url)")
      .eq("id", createdById)
      .maybeSingle();

    if (pub) {
      const t = pub.teachers as
        | { display_name?: string; photo_url?: string }
        | null;
      const role = (pub.role as string) ?? "user";
      publisher = {
        id: pub.id as string,
        name: t?.display_name ?? (pub.full_name as string) ?? "（投稿者）",
        photoUrl: t?.photo_url ?? null,
        role,
        isTeacher: role === "teacher",
      };
    }
  }

  const embedUrl = getEmbedUrl(video.video_url as string);
  const dateStr = new Date(video.created_at as string).toLocaleDateString(
    "ja-JP"
  );
  const categoryName = (video.categories as { name?: string } | null)?.name;

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
          {categoryName && <Badge variant="outline">{categoryName}</Badge>}
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

      {/* 投稿者カード */}
      {publisher && (
        <section className="mt-8">
          <h2 className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            投稿者
          </h2>
          {publisher.isTeacher ? (
            <Link
              href={`/teachers/${publisher.id}`}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
            >
              <div className="aspect-square w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                {publisher.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={publisher.photoUrl}
                    alt={publisher.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xl">
                    🎓
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold group-hover:text-primary">
                  {publisher.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABEL[publisher.role] ?? publisher.role}
                </p>
              </div>
              <span className="text-xs text-primary opacity-0 group-hover:opacity-100">
                プロフィール →
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
              <div className="aspect-square w-14 shrink-0 overflow-hidden rounded-full bg-primary-light/40">
                <div className="flex h-full items-center justify-center text-xl text-primary">
                  ✦
                </div>
              </div>
              <div>
                <p className="text-sm font-extrabold">{publisher.name}</p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABEL[publisher.role] ?? publisher.role}
                </p>
              </div>
            </div>
          )}
        </section>
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
