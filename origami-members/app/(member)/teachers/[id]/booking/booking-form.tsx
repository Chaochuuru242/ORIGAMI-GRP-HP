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
  useStripe,
}: {
  teacherId: string;
  slots: Slot[];
  pricePerSession: number;
  /** true: Stripe Checkout 経由 / false: 直接 confirmed (開発用) */
  useStripe: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // 直接予約（Stripe なし）用
  const [actionState, formAction, isPendingAction] = useActionState<
    CreateBookingState,
    FormData
  >(createBookingAction, {});

  const handleStripeCheckout = async () => {
    if (!selectedId) return;
    setStripeLoading(true);
    setStripeError(null);
    try {
      const res = await fetch("/api/stripe/booking-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacher_id: teacherId,
          availability_id: selectedId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setStripeError(err instanceof Error ? err.message : "Checkout failed");
      setStripeLoading(false);
    }
  };

  const slotPicker = (
    <>
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
    </>
  );

  if (useStripe) {
    return (
      <div>
        {slotPicker}
        {stripeError && (
          <p
            className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            role="alert"
          >
            {stripeError}
          </p>
        )}
        <div className="mt-6 flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            「決済へ進む」を押すと Stripe の安全な決済画面に遷移します
          </p>
          <Button
            type="button"
            onClick={handleStripeCheckout}
            disabled={!selectedId || stripeLoading}
          >
            {stripeLoading ? "Stripe にリダイレクト中..." : "💳 決済へ進む"}
          </Button>
        </div>
      </div>
    );
  }

  // Stripe なし（開発モード or 講師未接続）
  return (
    <form action={formAction}>
      <input type="hidden" name="teacher_id" value={teacherId} />
      <input type="hidden" name="availability_id" value={selectedId ?? ""} />
      {slotPicker}
      {actionState.error && (
        <p
          className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          role="alert"
        >
          {actionState.error}
        </p>
      )}
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">
          ※ 講師の Stripe 接続が未完了のため決済なしで予約します（開発モード）
        </p>
        <Button type="submit" disabled={!selectedId || isPendingAction}>
          {isPendingAction ? "予約中..." : "この時間で予約する"}
        </Button>
      </div>
    </form>
  );
}
