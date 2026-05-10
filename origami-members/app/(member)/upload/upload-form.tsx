"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadVideoAction, type UploadState } from "./actions";

type Category = { id: string; name: string };

export function UploadForm({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";

  const [state, formAction, isPending] = useActionState<UploadState, FormData>(
    uploadVideoAction,
    {}
  );

  return (
    <>
      {success && (
        <div className="mb-6 rounded-md border border-primary/40 bg-primary-light/40 p-4 text-sm">
          <strong className="font-bold text-primary">✓ 動画を申請しました</strong>
          <p className="mt-1 text-xs text-muted-foreground">
            管理者の承認後、コンテンツ一覧に公開されます。
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">
            タイトル <span className="text-destructive">*</span>
          </Label>
          <Input id="title" name="title" required maxLength={120} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="video_url">
            動画 URL（YouTube または Vimeo）{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Input
            id="video_url"
            name="video_url"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
          />
          <p className="text-xs text-muted-foreground">
            YouTube `watch?v=`、`youtu.be/`、Vimeo `vimeo.com/` 形式に対応
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail_url">サムネイル URL（任意）</Label>
          <Input
            id="thumbnail_url"
            name="thumbnail_url"
            type="url"
            placeholder="未指定の場合 YouTube は自動取得"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category_id">カテゴリ（任意）</Label>
            <select
              id="category_id"
              name="category_id"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">未分類</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_plan">
              対象プラン <span className="text-destructive">*</span>
            </Label>
            <select
              id="target_plan"
              name="target_plan"
              required
              defaultValue="all"
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">全プラン共通</option>
              <option value="light">ライト以上</option>
              <option value="standard">スタンダード以上</option>
              <option value="premium">プレミアム専用</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">概要（任意）</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_details">講義内容詳細（任意）</Label>
          <textarea
            id="content_details"
            name="content_details"
            rows={4}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="learning_materials">講義資料 URL（任意）</Label>
            <Input
              id="learning_materials"
              name="learning_materials"
              type="url"
              placeholder="PDFの公開URL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="practice_checks">実践チェックシート URL（任意）</Label>
            <Input
              id="practice_checks"
              name="practice_checks"
              type="url"
              placeholder="PDFの公開URL"
            />
          </div>
        </div>

        {state.error && (
          <p
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            role="alert"
          >
            {state.error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? "申請中..." : "動画を申請する"}
          </Button>
          <Button
            type="reset"
            variant="outline"
            disabled={isPending}
          >
            クリア
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          申請した動画は status=
          <code className="rounded bg-muted px-1">pending</code>{" "}
          で保存され、管理者が承認すると公開されます。
        </p>
      </form>
    </>
  );
}
