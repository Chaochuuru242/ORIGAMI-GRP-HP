"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  passwordUpdateAction,
  type UpdateState,
} from "./actions";

export default function PasswordUpdatePage() {
  const [state, formAction, isPending] = useActionState<UpdateState, FormData>(
    passwordUpdateAction,
    {}
  );

  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-extrabold">新パスワードの設定</h1>
      <p className="mb-8 text-xs text-muted-foreground">
        新しいパスワードを入力してください
      </p>

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">新しいパスワード（8文字以上）</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password_confirm">確認用パスワード</Label>
          <Input
            id="password_confirm"
            name="password_confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
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
          {isPending ? "更新中..." : "パスワードを更新する"}
        </Button>
      </form>
    </div>
  );
}
