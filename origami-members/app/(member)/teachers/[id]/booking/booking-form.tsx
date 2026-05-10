"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createBookingAction, type CreateBookingState } from "./actions";

export type Slot = {
  id: string;
  startAt: string;
  endAt: string;
};

export function BookingForm({
  teacherId,
  slots,
  pricePerSession,
}: {
  teacherId: string;
  slots: Slot[];
  pricePerSession: number;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState<
    CreateBookingState,
    FormData
  >(createBookingAction, {});

  return (
    <form action={formAction}>
      <input type="hidden" name="teacher_id" value={teacherId} />
      <input type="hidden" name="availability_id" value={selectedId ?? ""} />

      <p className="mb-4 text-sm font-bold">
        ご希望の時間帯をお選びください（60分・¥{pricePerSession.toLocaleString()}）
      </p>

      {slots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
          現在、予約可能な空き枠がありません。
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {slots.map((slot) => {
            const start = new Date(slot.startAt);
            const dateStr = start.toLocaleDateString("ja-JP", {
              month: "short",
              day: "numeric",
              weekday: "short",
            });
            const timeStr = start.toLocaleTimeString("ja-JP", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const isSelected = selectedId === slot.id;
            return (
              <button
                type="button"
                key={slot.id}
                onClick={() => setSelectedId(slot.id)}
                className={cn(
                  "rounded-lg border p-3 text-left text-sm transition",
                  isSelected
                    ? "border-primary bg-primary-light/40 ring-2 ring-primary"
                    : "border-border bg-card hover:border-primary/40"
                )}
              >
                <div className="font-bold">{dateStr}</div>
                <div className="text-xs text-muted-foreground">{timeStr} 〜</div>
              </button>
            );
          })}
        </div>
      )}

      {state.error && (
        <p
          className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          role="alert"
        >
          {state.error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          ※ 予約完了と同時に Google Meet リンクが講師から送られます（連携完了は最終
          Phase で）
        </p>
        <Button type="submit" disabled={!selectedId || isPending}>
          {isPending ? "予約中..." : "この時間で予約する"}
        </Button>
      </div>
    </form>
  );
}
