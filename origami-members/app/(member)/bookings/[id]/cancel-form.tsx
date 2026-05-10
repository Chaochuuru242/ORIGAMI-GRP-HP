"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  cancelBookingAction,
  type BookingActionState,
} from "@/app/(member)/teachers/[id]/booking/actions";

export function CancelForm({ bookingId }: { bookingId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState<
    BookingActionState,
    FormData
  >(cancelBookingAction, {});

  if (!confirming) {
    return (
      <Button
        type="button"
        variant="destructive"
        onClick={() => setConfirming(true)}
      >
        予約をキャンセル
      </Button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
      <input type="hidden" name="booking_id" value={bookingId} />
      <p className="text-sm font-bold text-destructive">
        本当にキャンセルしますか？
      </p>
      <textarea
        name="reason"
        rows={3}
        placeholder="キャンセル理由（任意）"
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
      />
      {state.error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit" variant="destructive" disabled={isPending}>
          {isPending ? "処理中..." : "キャンセル実行"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirming(false)}
        >
          戻る
        </Button>
      </div>
    </form>
  );
}
