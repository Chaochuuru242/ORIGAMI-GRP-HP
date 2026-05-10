"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createNewsAction,
  updateNewsAction,
  deleteNewsAction,
  type NewsState,
} from "./actions";

export type NewsItem = {
  id: string;
  title: string;
  body: string | null;
  published_at: string | null;
  created_at: string;
};

export function NewsClient({ items }: { items: NewsItem[] }) {
  const [createState, createAction, isPending] = useActionState<
    NewsState,
    FormData
  >(createNewsAction, {});

  return (
    <div className="space-y-8">
      {/* 新規追加 */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-extrabold">新規お知らせ追加</h2>
        <form action={createAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="title" className="text-xs">
              タイトル <span className="text-destructive">*</span>
            </Label>
            <Input id="title" name="title" required maxLength={120} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="body" className="text-xs">
              本文（任意・改行可）
            </Label>
            <textarea
              id="body"
              name="body"
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="published_at" className="text-xs">
              公開日時（未指定の場合は現在時刻）
            </Label>
            <Input
              id="published_at"
              name="published_at"
              type="datetime-local"
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? "追加中..." : "お知らせを公開する"}
          </Button>
        </form>
        {createState.error && (
          <p className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {createState.error}
          </p>
        )}
        {createState.success && (
          <p className="mt-3 rounded-md border border-primary/40 bg-primary-light/40 px-3 py-2 text-xs text-primary">
            {createState.success}
          </p>
        )}
      </section>

      {/* 一覧 */}
      <section className="space-y-3">
        <h2 className="text-base font-extrabold">既存のお知らせ ({items.length}件)</h2>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
            まだお知らせがありません。
          </div>
        ) : (
          items.map((n) => {
            const date = new Date(
              n.published_at ?? n.created_at
            ).toLocaleString("ja-JP");
            return (
              <div
                key={n.id}
                className="rounded-xl border border-border bg-card p-5"
              >
                <form action={updateNewsAction} className="space-y-3">
                  <input type="hidden" name="id" value={n.id} />
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[11px] text-muted-foreground">
                      {date}
                    </span>
                  </div>
                  <Input
                    name="title"
                    defaultValue={n.title}
                    className="font-bold"
                  />
                  <textarea
                    name="body"
                    defaultValue={n.body ?? ""}
                    rows={3}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button type="submit" size="sm" variant="outline">
                      更新
                    </Button>
                  </div>
                </form>
                <form
                  action={deleteNewsAction}
                  className="mt-2 flex justify-end"
                >
                  <input type="hidden" name="id" value={n.id} />
                  <Button type="submit" size="sm" variant="destructive">
                    削除
                  </Button>
                </form>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
