"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { promoteUserToTeacherAction, type InviteState } from "./actions";

type Candidate = { id: string; full_name: string | null; email: string };

export function PromoteForm({ candidates }: { candidates: Candidate[] }) {
  const [selectedId, setSelectedId] = useState<string>("");
  const selected = candidates.find((c) => c.id === selectedId);

  const [state, formAction, isPending] = useActionState<InviteState, FormData>(
    promoteUserToTeacherAction,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="user_id" className="text-xs">
          講師に昇格するユーザー <span className="text-destructive">*</span>
        </Label>
        <select
          id="user_id"
          name="user_id"
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          required
          className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="">候補ユーザーを選択...</option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name ?? "(未設定)"} — {c.email}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-muted-foreground">
          ※ 既存ユーザーから選んでください。新規招待は別途運営でメール送信してから登録してください。
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="display_name" className="text-xs">
            講師表示名 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="display_name"
            name="display_name"
            required
            defaultValue={selected?.full_name ?? ""}
            placeholder="プロフィール公開時の名前"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="price_per_session" className="text-xs">
            面談料金（60分・税込・円）
          </Label>
          <Input
            id="price_per_session"
            name="price_per_session"
            type="number"
            min={0}
            defaultValue={5000}
          />
        </div>
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
        {isPending ? "登録中..." : "講師として登録（初期は非公開）"}
      </Button>
      <p className="text-[11px] text-muted-foreground">
        登録後、講師本人がプロフィール（自己紹介・専門分野）を整え、admin が公開フラグを ON にすると講師一覧に表示されます。
      </p>
    </form>
  );
}
