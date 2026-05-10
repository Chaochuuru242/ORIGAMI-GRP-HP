"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPlaylistAction, type PlaylistState } from "./actions";

export function PlaylistCreateForm() {
  const [state, action, isPending] = useActionState<PlaylistState, FormData>(
    createPlaylistAction,
    {}
  );

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="title" className="text-xs">
          プレイリスト名 <span className="text-destructive">*</span>
        </Label>
        <Input id="title" name="title" required maxLength={120} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="target_plan" className="text-xs">
            対象プラン
          </Label>
          <select
            id="target_plan"
            name="target_plan"
            defaultValue="all"
            className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="all">全プラン共通</option>
            <option value="light">ライト以上</option>
            <option value="standard">スタンダード以上</option>
            <option value="premium">プレミアム専用</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="sort_order" className="text-xs">
            並び順
          </Label>
          <Input id="sort_order" name="sort_order" type="number" defaultValue={0} />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="description" className="text-xs">
          説明（任意）
        </Label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="thumbnail_url" className="text-xs">
          サムネイル URL（任意）
        </Label>
        <Input id="thumbnail_url" name="thumbnail_url" type="url" />
      </div>

      {state.error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "作成中..." : "プレイリストを作成 → 編集画面へ"}
      </Button>
    </form>
  );
}
