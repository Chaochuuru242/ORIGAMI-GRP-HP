"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const REASONS = [
  { value: "price", label: "料金が高い" },
  { value: "unused", label: "あまり使わなかった" },
  { value: "content_mismatch", label: "学びたい内容と合わなかった" },
  { value: "temporary", label: "一時的に休止したい（後で再開予定）" },
  { value: "other", label: "その他" },
];

export function CancelForm() {
  const router = useRouter();
  const [reason, setReason] = useState<string>("");
  const [freeText, setFreeText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("解約理由を選択してください。");
      return;
    }
    if (!confirm("本当に解約しますか？期間末まではご利用いただけます。")) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, free_text: freeText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "解約処理に失敗しました");
      router.push("/account/billing?canceled=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cancel failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <fieldset className="space-y-2">
        <Label className="text-sm">解約理由を教えてください（任意）</Label>
        {REASONS.map((r) => (
          <label
            key={r.value}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card p-3 text-sm hover:border-primary/40"
          >
            <input
              type="radio"
              name="reason"
              value={r.value}
              checked={reason === r.value}
              onChange={(e) => setReason(e.target.value)}
              className="accent-primary"
            />
            {r.label}
          </label>
        ))}
      </fieldset>

      <div className="space-y-1">
        <Label htmlFor="free_text" className="text-sm">
          ご意見・改善要望（任意）
        </Label>
        <textarea
          id="free_text"
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" variant="destructive" disabled={loading || !reason}>
          {loading ? "処理中..." : "解約を確定する"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/account/billing")}
          disabled={loading}
        >
          戻る
        </Button>
      </div>
    </form>
  );
}
