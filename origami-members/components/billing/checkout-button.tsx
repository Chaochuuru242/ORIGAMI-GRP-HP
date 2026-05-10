"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Plan } from "@/lib/plan/constants";

export function CheckoutButton({
  plan,
  isLoggedIn,
  variant = "default",
  className = "",
  label,
}: {
  plan: Plan;
  isLoggedIn: boolean;
  variant?: "default" | "outline";
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoggedIn) {
    return (
      <a
        href={`/login?redirect=/pricing`}
        className="block w-full"
      >
        <Button className={`w-full ${className}`} variant={variant}>
          {label ?? "ログインして購入"}
        </Button>
      </a>
    );
  }

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleClick}
        disabled={loading}
        variant={variant}
        className={`w-full ${className}`}
      >
        {loading ? "Stripe にリダイレクト中..." : label ?? "このプランで申し込む"}
      </Button>
      {error && (
        <p className="mt-2 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
          {error}
        </p>
      )}
    </>
  );
}
