"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type NewsState = {
  error?: string;
  success?: string;
};

export async function createNewsAction(
  _prev: NewsState,
  formData: FormData
): Promise<NewsState> {
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const publishedAt = String(formData.get("published_at") ?? "").trim();

  if (!title) return { error: "タイトルは必須です。" };

  const supabase = await createClient();
  const { error } = await supabase.from("news").insert({
    title,
    body: body || null,
    published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
  });

  if (error) return { error: `登録エラー: ${error.message}` };

  revalidatePath("/admin/news");
  revalidatePath("/dashboard");
  return { success: `お知らせ「${title}」を追加しました。` };
}

export async function updateNewsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!id || !title) return;

  const supabase = await createClient();
  await supabase
    .from("news")
    .update({ title, body: body || null })
    .eq("id", id);

  revalidatePath("/admin/news");
  revalidatePath("/dashboard");
}

export async function deleteNewsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("news").delete().eq("id", id);

  revalidatePath("/admin/news");
  revalidatePath("/dashboard");
}
