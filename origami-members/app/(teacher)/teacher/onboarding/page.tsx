import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "Stripe 接続手順 | ORIGAMI GRP" };

export default function TeacherOnboardingPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">💳 Stripe 接続（決済受け取り設定）</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          面談料金を受け取るために Stripe Connect への接続が必要です
        </p>
      </header>

      <Card className="mb-6 border-amber-200 bg-amber-50/30">
        <CardContent className="py-6">
          <p className="mb-2 text-sm font-extrabold text-amber-700">
            🚧 この機能は最終 Phase で実装予定です
          </p>
          <p className="text-xs leading-6 text-muted-foreground">
            現状、Stripe Connect 接続は未実装のため、面談予約と決済機能はご利用いただけません。
            <br />
            実装完了次第メールでお知らせします。それまでは、プロフィール編集・空き時間設定の準備のみ可能です。
          </p>
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
