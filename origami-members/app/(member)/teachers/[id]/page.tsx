import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompleteProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "講師プロフィール | ORIGAMI GRP メンバーズ" };

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile } = await requireCompleteProfile();
  const supabase = await createClient();

  const { data: teacher } = await supabase
    .from("teachers")
    .select(
      "id, display_name, bio, photo_url, specialties, price_per_session, is_active, stripe_onboarding_completed"
    )
    .eq("id", id)
    .maybeSingle();

  if (!teacher) notFound();

  const isAdminOrSelf =
    profile.role === "admin" || profile.id === (teacher.id as string);

  // 非公開の場合、admin or 本人以外には見せない
  if (!teacher.is_active && !isAdminOrSelf) {
    notFound();
  }

  const stripeReady = teacher.stripe_onboarding_completed as boolean;
  const specialties = (teacher.specialties as string[]) ?? [];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/teachers"
        className="mb-6 inline-block text-xs text-muted-foreground hover:text-primary"
      >
        ← 講師一覧へ
      </Link>

      {!teacher.is_active && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          ⚠ このプロフィールは非公開状態です（プレビュー表示）
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-[200px_1fr]">
        <div>
          <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
            {teacher.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={teacher.photo_url as string}
                alt={teacher.display_name as string}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl text-muted-foreground">
                🎓
              </div>
            )}
          </div>
        </div>

        <div>
          <h1 className="mb-2 text-3xl font-extrabold">
            {teacher.display_name as string}
          </h1>
          <p className="mb-4 text-2xl font-extrabold text-primary">
            ¥{(teacher.price_per_session as number).toLocaleString()}
            <span className="ml-1 text-sm font-normal text-muted-foreground">
              / 60分
            </span>
          </p>

          {specialties.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {specialties.map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {teacher.bio && (
            <Card className="mb-6">
              <CardContent className="py-5">
                <h2 className="mb-2 text-sm font-extrabold">自己紹介</h2>
                <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
                  {teacher.bio as string}
                </p>
              </CardContent>
            </Card>
          )}

          <Button render={<Link href={`/teachers/${id}/booking`} />} size="lg">
            📅 面談を予約する
          </Button>
          {!stripeReady && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              ※ 現在は決済ステップ未実装のため料金はかかりません（最終 Phase で
              Stripe 決済を導入予定）
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
