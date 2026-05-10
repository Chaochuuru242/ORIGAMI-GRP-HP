"use client";

import { useActionState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sendSupportMessageAction, type SupportState } from "./actions";

export function SupportForm() {
  const [state, formAction, isPending] = useActionState<SupportState, FormData>(
    sendSupportMessageAction,
    {}
  );
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) ref.current?.reset();
  }, [state.success]);

  return (
    <form action={formAction} ref={ref} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="body" className="text-xs">
          お問い合わせ内容（2000文字以内）
        </Label>
        <textarea
          id="body"
          name="body"
          rows={6}
          required
          maxLength={2000}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          placeholder="ご質問・ご要望などをお書きください..."
        />
      </div>

      {state.error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md border border-primary/40 bg-primary-light/40 px-3 py-2 text-xs text-primary">
          ✓ 送信しました。サポートチームから順次お返事します。
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "送信中..." : "送信する"}
      </Button>
    </form>
  );
}
