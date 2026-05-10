import Link from "next/link";
import { requireTeacherOrAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "講師ダッシュボード | ORIGAMI GRP" };

export default async function TeacherDashboardPage() {
  const { user, profile } = await requireTeacherOrAdmin();
  const supabase = await createClient();

  const { data: teacher } = await supabase
    .from("teachers")
    .select(
      "id, display_name, is_active, stripe_onboarding_completed, photo_url, bio, specialties, price_per_session"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!teacher) {
    // admin の場合、自分自身が teachers にないことがある
    return (
      <div className="mx-auto max-w-2xl px-6 py-16">
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-10 text-center">
          <h1 className="mb-3 text-xl font-extrabold">
            講師として登録されていません
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            あなたは admin ロールですが、teachers テーブルに登録されていません。
            <br />
            講師として活動する場合は admin 画面から自分を講師に登録してください。
          </p>
          <Button render={<Link href="/admin/teachers" />} variant="outline">
            講師管理画面へ →
          </Button>
        </div>
      </div>
    );
  }

  // 自分への予約一覧（Phase 6 で正式実装）
  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", user.id)
    .eq("status", "confirmed");

  const { count: availabilityCount } = await supabase
    .from("teacher_availabilities")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", user.id)
    .eq("is_booked", false)
    .gte("start_at", new Date().toISOString());

  const isActive = teacher.is_active as boolean;
  const stripeReady = teacher.stripe_onboarding_completed as boolean;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">
          🎓 講師ダッシュボード — {profile.full_name ?? "講師"} さん
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          講師としての公開状況・予約一覧を確認できます
        </p>
      </header>

      {/* ステータス通知 */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Card
          className={
            isActive ? "border-emerald-200 bg-emerald-50/30" : "border-amber-200 bg-amber-50/30"
          }
        >
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground">公開状況</p>
              <p
                className={
                  isActive
                    ? "text-base font-extrabold text-emerald-700"
                    : "text-base font-extrabold text-amber-700"
                }
              >
                {isActive ? "✓ ユーザーに公開中" : "⏸ 非公開（未承認）"}
              </p>
            </div>
            {!isActive && (
              <Badge variant="outline" className="border-amber-300">
                admin の承認待ち
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card
          className={
            stripeReady ? "border-sky-200 bg-sky-50/30" : "border-border"
          }
        >
          <CardContent className="flex items-center justify-between py-4">
            <div>
              <p className="text-xs font-bold text-muted-foreground">
                Stripe 接続
              </p>
              <p className="text-base font-extrabold">
                {stripeReady ? "✓ 接続済（決済可能）" : "未接続"}
              </p>
            </div>
            {!stripeReady && (
              <Button
                render={<Link href="/teacher/onboarding" />}
                size="sm"
                variant="outline"
              >
                接続手順 →
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* メトリクス */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">📅 確定済 予約</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-primary">
              {bookingCount ?? 0}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                件
              </span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">🕒 公開中の空き枠</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-primary">
              {availabilityCount ?? 0}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                枠
              </span>
            </p>
            <Button
              render={<Link href="/teacher/availability" />}
              size="sm"
              variant="outline"
              className="mt-3 text-xs"
            >
              空き時間を設定 →
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">💴 料金設定</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-primary">
              ¥{(teacher.price_per_session as number).toLocaleString()}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                /60分
              </span>
            </p>
            <Button
              render={<Link href="/teacher/profile" />}
              size="sm"
              variant="outline"
              className="mt-3 text-xs"
            >
              料金を変更 →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* クイックアクション */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">クイックアクション</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button
            render={<Link href="/teacher/profile" />}
            variant="outline"
            className="text-xs"
          >
            👤 プロフィール編集
          </Button>
          <Button
            render={<Link href="/teacher/availability" />}
            variant="outline"
            className="text-xs"
          >
            📅 空き時間管理
          </Button>
          <Button
            render={<Link href="/teacher/onboarding" />}
            variant="outline"
            className="text-xs"
          >
            💳 Stripe接続手順
          </Button>
          <Button
            render={<Link href={`/teachers/${user.id}`} />}
            variant="outline"
            className="text-xs"
          >
            🔍 公開ページを確認
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
