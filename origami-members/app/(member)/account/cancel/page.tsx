import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/guards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CancelForm } from "./cancel-form";

export const metadata = { title: "解約手続き | ORIGAMI GRP メンバーズ" };

export default async function CancelPage() {
  const { profile } = await requireUser();

  if (profile.plan === "free") {
    redirect("/account/billing");
  }
  if (profile.cancel_at_period_end) {
    redirect("/account/billing");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">解約手続き</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          差し支えなければ、改善のため理由をお聞かせください
        </p>
      </header>

      <Card className="mb-6 border-amber-200 bg-amber-50/30">
        <CardHeader>
          <CardTitle className="text-sm text-amber-800">解約後の動作</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs text-amber-900">
          <p>
            ✓ 契約期間（次回更新日まで）は引き続きすべての機能をご利用いただけます。
          </p>
          <p>✓ 期間終了時に自動更新が停止し、無料会員に降格します。</p>
          <p>
            ✓
            退会（アカウント削除）はせず、視聴履歴・プロフィールは保持されます。
          </p>
          <p>
            ✓ 期間内であれば「解約取り消し」が可能です。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <CancelForm />
        </CardContent>
      </Card>
    </div>
  );
}
