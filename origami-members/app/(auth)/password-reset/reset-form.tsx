"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { passwordResetAction, type ResetState } from "./actions";

export function PasswordResetForm() {
  const [state, formAction, isPending] = useActionState<ResetState, FormData>(
    passwordResetAction,
    {}
  );

  if (state.success) {
    return (
      <div className="rounded-md border border-primary/40 bg-primary-light/40 p-5 text-sm">
        <p className="mb-2 font-bold text-primary">
          📧 再設定メールを送信しました
        </p>
        <p className="text-muted-foreground">
          メール内のリンクから新しいパスワードを設定してください。
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-xs text-primary underline"
        >
          ログインページへ戻る
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">登録時のメールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      {state.error && (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "送信中..." : "再設定メールを送信"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          ← ログインに戻る
        </Link>
      </p>
    </form>
  );
}
