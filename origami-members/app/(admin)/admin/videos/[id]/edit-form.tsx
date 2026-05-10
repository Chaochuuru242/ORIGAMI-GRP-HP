"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateVideoAction,
  deleteVideoAction,
  type EditState,
} from "./actions";

type Category = { id: string; name: string };

export type VideoEditData = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  target_plan: string;
  category_id: string | null;
  status: string;
  content_details: string | null;
  learning_materials: string | null;
  practice_checks: string | null;
};

export function EditForm({
  video,
  categories,
}: {
  video: VideoEditData;
  categories: Category[];
}) {
  const [state, formAction, isPending] = useActionState<EditState, FormData>(
    updateVideoAction,
    {}
  );

  return (
    <>
      {state.success && (
        <div className="mb-6 rounded-md border border-primary/40 bg-primary-light/40 p-4 text-sm">
          <strong className="font-bold text-primary">✓ 保存しました</strong>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="id" value={video.id} />

        <div className="space-y-2">
          <Label htmlFor="title">
            タイトル <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            required
            defaultValue={video.title}
            maxLength={120}
          />
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
            defaultValue={video.video_url}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="thumbnail_url">サムネイル URL（任意）</Label>
          <Input
            id="thumbnail_url"
            name="thumbnail_url"
            type="url"
            defaultValue={video.thumbnail_url ?? ""}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="category_id">カテゴリ（任意）</Label>
            <select
              id="category_id"
              name="category_id"
              defaultValue={video.category_id ?? ""}
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
              defaultValue={video.target_plan}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="all">全プラン共通</option>
              <option value="light">ライト以上</option>
              <option value="standard">スタンダード以上</option>
              <option value="premium">プレミアム専用</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">公開状態</Label>
            <select
              id="status"
              name="status"
              defaultValue={video.status}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="published">公開中</option>
              <option value="pending">承認待ち（非公開）</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">概要（任意）</Label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={video.description ?? ""}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content_details">講義内容詳細（任意）</Label>
          <textarea
            id="content_details"
            name="content_details"
            rows={4}
            defaultValue={video.content_details ?? ""}
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
              defaultValue={video.learning_materials ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="practice_checks">
              実践チェックシート URL（任意）
            </Label>
            <Input
              id="practice_checks"
              name="practice_checks"
              type="url"
              defaultValue={video.practice_checks ?? ""}
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

        <div className="flex justify-between">
          <Button type="submit" disabled={isPending}>
            {isPending ? "保存中..." : "💾 保存する"}
          </Button>
        </div>
      </form>

      <form
        action={deleteVideoAction}
        className="mt-8 rounded-md border border-destructive/30 bg-destructive/5 p-5"
        onSubmit={(e) => {
          if (
            !confirm(
              "この動画を削除します。視聴履歴・資料DL履歴は残ります。よろしいですか？"
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={video.id} />
        <h3 className="mb-2 text-sm font-extrabold text-destructive">
          動画を削除
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          動画レコードを完全に削除します（プレイリストからも自動的に外れます）。視聴履歴・資料DL履歴は外部キーが NULL になるよう設計されています。
        </p>
        <Button type="submit" variant="destructive" size="sm">
          🗑 削除を実行
        </Button>
      </form>
    </>
  );
}
