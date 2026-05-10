"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addAvailabilityAction, type AvailabilityState } from "./actions";

export function AvailabilityForm() {
  const [state, formAction, isPending] = useActionState<
    AvailabilityState,
    FormData
  >(addAvailabilityAction, {});

  // デフォルト：明日の 10:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);
  const defaultValue = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}T${String(tomorrow.getHours()).padStart(2, "0")}:${String(tomorrow.getMinutes()).padStart(2, "0")}`;

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="start_at" className="text-xs">
          開始日時（60分1コマ・自動で +60分 を end_at に設定）
        </Label>
        <Input
          id="start_at"
          name="start_at"
          type="datetime-local"
          required
          defaultValue={defaultValue}
        />
      </div>

      {state.error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="rounded-md border border-primary/40 bg-primary-light/40 px-3 py-2 text-xs text-primary">
          {state.success}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "追加中..." : "+ 空き枠を追加"}
      </Button>
    </form>
  );
}
