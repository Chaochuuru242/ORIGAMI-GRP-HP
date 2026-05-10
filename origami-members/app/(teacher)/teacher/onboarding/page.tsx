import Link from "next/link";
import { requireTeacherOrAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { isStripeReady } from "@/lib/stripe/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectStartButton, ConnectDashboardButton } from "./connect-buttons";

export const metadata = { title: "Stripe 接続手順 | ORIGAMI GRP" };

export default async function TeacherOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ completed?: string; refresh?: string }>;
}) {
  const { completed, refresh } = await searchParams;
  const { user } = await requireTeacherOrAdmin();
  const supabase = await createClient();
  const stripeReady = isStripeReady();

  const { data: teacher } = await supabase
    .from("teachers")
    .select("stripe_account_id, stripe_onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const accountId = teacher?.stripe_account_id as string | null;
  const onboardingCompleted =
    (teacher?.stripe_onboarding_completed as boolean) ?? false;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">💳 Stripe 接続（決済受け取り設定）</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          面談料金を受け取るために Stripe Connect への接続が必要です
        </p>
      </header>

      {completed && (
        <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          ✓ Stripe からの戻りを確認しました。承認状況は下のステータスで確認できます。
        </div>
      )}
      {refresh && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⏳ Stripe オンボーディングを再開してください。
        </div>
      )}

      {!stripeReady && (
        <Card className="mb-6 border-amber-200 bg-amber-50/30">
          <CardContent className="py-6">
            <p className="text-sm font-extrabold text-amber-700">
              ⚠ サイト全体で Stripe が未設定です
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              管理者の方は `.env.local` に STRIPE_SECRET_KEY を設定してください。
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">現在のステータス</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {accountId
                  ? `Account ID: ${accountId.slice(0, 16)}...`
                  : "未接続"}
              </p>
            </div>
            {onboardingCompleted ? (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                ✓ 接続完了
              </Badge>
            ) : accountId ? (
              <Badge variant="outline" className="border-amber-300 text-amber-700">
                ⏳ オンボーディング中
              </Badge>
            ) : (
              <Badge variant="outline">未接続</Badge>
            )}
          </div>

          <div className="mt-5 space-y-3">
            {!onboardingCompleted && stripeReady && <ConnectStartButton />}
            {accountId && stripeReady && <ConnectDashboardButton />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <h2 className="mb-4 text-base font-extrabold">事前にご準備ください</h2>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              <span>
                <strong className="text-foreground">本人確認書類</strong>
                （運転免許証 / マイナンバーカード / パスポート）
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              <span>
                <strong className="text-foreground">受取用銀行口座</strong>
                （ご本人名義のもの）
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary">✓</span>
              <span>
                <strong className="text-foreground">マイナンバー</strong>
                （税務上必要となります）
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <div className="mt-8 flex justify-end">
        <Button render={<Link href="/teacher/dashboard" />} variant="outline">
          ← 講師ダッシュボードへ
        </Button>
      </div>
    </div>
  );
}
