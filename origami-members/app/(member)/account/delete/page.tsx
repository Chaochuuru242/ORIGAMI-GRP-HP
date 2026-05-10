"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { deleteAccountAction, type DeleteState } from "./actions";

export default function DeleteAccountPage() {
  const [state, formAction, isPending] = useActionState<DeleteState, FormData>(
    deleteAccountAction,
    {}
  );

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold text-destructive">退会手続き</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          アカウントを完全に削除します。この操作は取り消せません。
        </p>
      </header>

      <Card className="mb-6 border-destructive/30 bg-destructive/5">
        <CardContent className="py-6 text-sm">
          <p className="mb-3 font-bold text-destructive">退会すると以下のデータが削除されます：</p>
          <ul className="list-inside list-disc space-y-1 text-xs text-muted-foreground">
            <li>プロフィール情報</li>
            <li>視聴履歴・ダウンロード履歴</li>
            <li>サポートへのお問い合わせ履歴</li>
            <li>Stripe Customer 情報（請求履歴は Stripe 側に残ります）</li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            ※ 30日間はソフトデリート状態で保持し、その後物理削除されます。
            <br />※ 同じメールアドレスでの再登録は可能です（履歴は引き継がれません）。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="confirm_text" className="text-sm">
                確認のため、下のテキストボックスに「
                <strong className="text-destructive">退会します</strong>」と入力してください
              </Label>
              <Input
                id="confirm_text"
                name="confirm_text"
                placeholder="退会します"
                required
              />
            </div>

            {state.error && (
              <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {state.error}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? "処理中..." : "退会を実行する"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                render={<Link href="/account/billing" />}
              >
                戻る
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
