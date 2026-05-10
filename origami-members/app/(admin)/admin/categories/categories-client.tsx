"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  type CategoryState,
} from "./actions";

export type Category = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  videoCount: number;
};

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const [createState, createAction, isPending] = useActionState<
    CategoryState,
    FormData
  >(createCategoryAction, {});

  return (
    <div className="space-y-8">
      {/* 新規追加 */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-extrabold">新規カテゴリ追加</h2>
        <form
          action={createAction}
          className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr_auto]"
        >
          <div className="space-y-1">
            <Label htmlFor="name" className="text-xs">
              カテゴリ名 <span className="text-destructive">*</span>
            </Label>
            <Input id="name" name="name" required placeholder="AI・ChatGPT" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="slug" className="text-xs">
              slug（任意・英数字）
            </Label>
            <Input id="slug" name="slug" placeholder="自動生成 (ai-chatgpt)" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="sort_order" className="text-xs">
              並び順
            </Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              defaultValue={0}
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "追加中..." : "追加"}
            </Button>
          </div>
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
      <section className="rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                カテゴリ名
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                slug
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                並び順
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                動画数
              </th>
              <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0">
                <form
                  action={updateCategoryAction}
                  className="contents"
                >
                  <input type="hidden" name="id" value={c.id} />
                  <td className="px-4 py-3">
                    <Input
                      name="name"
                      defaultValue={c.name}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {c.slug}
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      name="sort_order"
                      type="number"
                      defaultValue={c.sort_order}
                      className="h-8 w-20 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {c.videoCount}本
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button type="submit" size="sm" variant="outline">
                        更新
                      </Button>
                    </div>
                  </td>
                </form>
                <td colSpan={0}>
                  <form action={deleteCategoryAction} className="hidden">
                    <input type="hidden" name="id" value={c.id} />
                  </form>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  カテゴリがまだ登録されていません。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* 削除専用 */}
      {categories.length > 0 && (
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h3 className="mb-3 text-sm font-extrabold text-destructive">
            削除（動画が紐付いているカテゴリは削除できません）
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <form action={deleteCategoryAction} key={c.id}>
                <input type="hidden" name="id" value={c.id} />
                <Button
                  type="submit"
                  size="sm"
                  variant="destructive"
                  disabled={c.videoCount > 0}
                  title={
                    c.videoCount > 0
                      ? `${c.videoCount}本の動画が紐付いているため削除不可`
                      : "削除"
                  }
                >
                  🗑 {c.name}
                  {c.videoCount > 0 && ` (${c.videoCount}本)`}
                </Button>
              </form>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
