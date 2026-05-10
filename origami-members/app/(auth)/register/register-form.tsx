"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction, type RegisterState } from "./actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState<RegisterState, FormData>(
    registerAction,
    {}
  );

  if (state.success) {
    return (
      <div className="rounded-md border border-primary/40 bg-primary-light/40 p-5 text-sm">
        <p className="mb-2 font-bold text-primary">📧 確認メールを送信しました</p>
        <p className="text-muted-foreground">
          ご登録のメールアドレス宛にメールをお送りしました。<br />
          メール内のリンクをクリックして登録を完了してください。
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block text-xs text-primary underline"
        >
          ログインページへ
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="full_name">お名前</Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          placeholder="山田 太郎"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">パスワード（8文字以上）</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="••••••••"
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
        {isPending ? "送信中..." : "確認メールを送信する"}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        既にアカウントをお持ちの方は
        <Link href="/login" className="ml-1 text-primary hover:underline">
          ログイン
        </Link>
      </p>

      <p className="text-center text-[10px] text-muted-foreground">
        登録ボタンを押すことで利用規約・プライバシーポリシーに同意したものとみなします
      </p>
    </form>
  );
}
