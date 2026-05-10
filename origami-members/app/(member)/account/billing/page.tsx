import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLAN_NAMES, PLAN_PRICES_JPY, type Plan } from "@/lib/plan/constants";
import { isStripeReady } from "@/lib/stripe/client";
import { PortalButton } from "./portal-button";
import { ResumeButton } from "./resume-button";

export const metadata = { title: "お支払い・プラン | ORIGAMI GRP メンバーズ" };

const STATUS_LABELS: Record<string, string> = {
  active: "有効",
  past_due: "支払い失敗（要更新）",
  canceled: "解約済",
  unpaid: "未払い",
  trialing: "トライアル中",
  incomplete: "未完了",
};

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const { profile } = await requireUser();
  const stripeReady = isStripeReady();

  const plan = profile.plan as Plan;
  const isPaidPlan = plan !== "free";
  const subStatus = profile.subscription_status;
  const cancelAtPeriodEnd = profile.cancel_at_period_end;
  const periodEnd = profile.current_period_end
    ? new Date(profile.current_period_end)
    : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">💳 お支払い・プラン管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          現在のプランの確認・変更・解約ができます
        </p>
      </header>

      {success && (
        <div className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          ✓ Stripe での決済が完了しました。プランは数秒以内に反映されます。
        </div>
      )}

      {!stripeReady && (
        <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          ⚠ 決済機能は現在準備中です（Stripe 接続未設定）。
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            契約中のプラン
            <Badge
              variant="outline"
              className={
                plan === "free"
                  ? "bg-muted text-muted-foreground"
                  : "bg-primary text-primary-foreground"
              }
            >
              {PLAN_NAMES[plan]}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isPaidPlan ? (
            <>
              <p className="text-3xl font-extrabold text-primary">
                ¥{PLAN_PRICES_JPY[plan].toLocaleString()}
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  / 月（税込）
                </span>
              </p>
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                <div>
                  <span className="font-bold">サブスク状態:</span>{" "}
                  {STATUS_LABELS[subStatus ?? ""] ?? subStatus ?? "—"}
                </div>
                {periodEnd && (
                  <div>
                    <span className="font-bold">
                      {cancelAtPeriodEnd ? "利用可能期限" : "次回更新日"}:
                    </span>{" "}
                    {periodEnd.toLocaleDateString("ja-JP")}
                  </div>
                )}
              </div>

              {cancelAtPeriodEnd && (
                <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
                  <p className="font-bold text-amber-800">⚠ 解約予約済み</p>
                  <p className="mt-1 text-xs text-amber-700">
                    {periodEnd?.toLocaleDateString("ja-JP")}{" "}
                    で自動更新が停止されます。それまでは引き続き全機能をご利用いただけます。
                  </p>
                  <div className="mt-3">
                    <ResumeButton />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                現在は無料会員です。動画視聴は「全プラン共通」のみ可能です。
              </p>
              <Button render={<Link href="/pricing" />} className="mt-4">
                有料プランを見る →
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {isPaidPlan && stripeReady && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">支払い情報の管理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-muted-foreground">
              カード情報の変更・請求履歴の確認・領収書のダウンロードは Stripe Portal をご利用ください。
            </p>
            <PortalButton />
          </CardContent>
        </Card>
      )}

      {isPaidPlan && !cancelAtPeriodEnd && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-sm text-destructive">解約手続き</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-xs text-muted-foreground">
              解約後も契約期間終了までは引き続きコンテンツを視聴できます。
            </p>
            <Button
              render={<Link href="/account/cancel" />}
              variant="destructive"
            >
              解約手続きへ進む
            </Button>
          </CardContent>
        </Card>
      )}

      {!isPaidPlan && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-xs text-muted-foreground">
            アカウントを完全に削除する場合は{" "}
            <Link
              href="/account/delete"
              className="text-destructive underline"
            >
              退会フォーム
            </Link>{" "}
            から手続きしてください。
          </CardContent>
        </Card>
      )}
    </div>
  );
}
