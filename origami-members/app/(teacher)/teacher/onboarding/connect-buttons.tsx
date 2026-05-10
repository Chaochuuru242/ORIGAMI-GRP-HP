"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ConnectStartButton({ disabled }: { disabled?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/connect/onboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Onboarding failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onboarding failed");
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="button" onClick={handle} disabled={disabled || loading} size="lg">
        {loading ? "Stripe にリダイレクト中..." : "🔗 Stripe Connect 接続を開始"}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </>
  );
}

export function ConnectDashboardButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/connect/dashboard", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Dashboard link failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Dashboard link failed");
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="button" variant="outline" onClick={handle} disabled={loading}>
        {loading ? "リダイレクト中..." : "📊 Stripe Express ダッシュボードを開く"}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-destructive">{error}</p>
      )}
    </>
  );
}
