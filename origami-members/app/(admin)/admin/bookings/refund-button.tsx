"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RefundButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (
      !confirm(
        "全額返金を実行します。Stripe で返金処理が走り、講師への送金も巻き戻されます。よろしいですか？"
      )
    )
      return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Refund failed");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Refund failed");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        onClick={handle}
        disabled={loading}
        className="text-xs"
      >
        {loading ? "..." : "💸 返金"}
      </Button>
      {error && <p className="mt-1 text-[10px] text-destructive">{error}</p>}
    </>
  );
}
