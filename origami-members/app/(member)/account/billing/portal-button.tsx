"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function PortalButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Portal session failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Portal session failed");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handle}
        disabled={disabled || loading}
      >
        {loading ? "Stripe にリダイレクト中..." : "💳 カード変更・請求履歴 (Stripe Portal)"}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </>
  );
}
