"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ResumeButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    if (!confirm("解約予約を取り消し、自動更新を再開します。よろしいですか？")) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/resume", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Resume failed");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resume failed");
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="button" onClick={handle} disabled={loading}>
        {loading ? "処理中..." : "解約を取り消して継続する"}
      </Button>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </>
  );
}
