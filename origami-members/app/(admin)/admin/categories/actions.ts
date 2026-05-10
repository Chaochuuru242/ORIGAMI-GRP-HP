"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CategoryState = {
  error?: string;
  success?: string;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export async function createCategoryAction(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  const name = String(formData.get("name") ?? "").trim();
  const slugInput = String(formData.get("slug") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!name) return { error: "カテゴリ名は必須です。" };

  const slug = slugInput || slugify(name);
  if (!slug) return { error: "slug を生成できませんでした。手動入力してください。" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .insert({ name, slug, sort_order: sortOrder });

  if (error) {
    if (error.code === "23505")
      return { error: `slug "${slug}" は既に使われています。` };
    return { error: `登録エラー: ${error.message}` };
  }

  revalidatePath("/admin/categories");
  return { success: `カテゴリ「${name}」を追加しました。` };
}

export async function updateCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!id || !name) return;

  const supabase = await createClient();
  await supabase
    .from("categories")
    .update({ name, sort_order: sortOrder })
    .eq("id", id);

  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();

  // 紐付いている動画があるか確認
  const { count } = await supabase
    .from("videos")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id);

  if ((count ?? 0) > 0) {
    return; // 紐付き動画ありの場合は削除しない（フロントで案内）
  }

  await supabase.from("categories").delete().eq("id", id);
  revalidatePath("/admin/categories");
}
