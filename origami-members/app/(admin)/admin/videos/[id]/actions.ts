"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TARGET_PLANS, type TargetPlan } from "@/lib/plan/constants";

export type EditState = {
  error?: string;
  success?: boolean;
};

export async function updateVideoAction(
  _prev: EditState,
  formData: FormData
): Promise<EditState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "id がありません。" };

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim();
  const targetPlan = String(formData.get("target_plan") ?? "all").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const status = String(formData.get("status") ?? "published").trim();
  const contentDetails = String(formData.get("content_details") ?? "").trim();
  const learningMaterials = String(
    formData.get("learning_materials") ?? ""
  ).trim();
  const practiceChecks = String(formData.get("practice_checks") ?? "").trim();

  if (!title || !videoUrl || !categoryId) {
    return { error: "タイトル・動画URL・カテゴリは必須です。" };
  }
  if (!TARGET_PLANS.includes(targetPlan as TargetPlan)) {
    return { error: "対象プランの値が不正です。" };
  }
  if (!["pending", "published"].includes(status)) {
    return { error: "ステータスの値が不正です。" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("videos")
    .update({
      title,
      description: description || null,
      video_url: videoUrl,
      thumbnail_url: thumbnailUrl || null,
      target_plan: targetPlan,
      category_id: categoryId,
      status,
      content_details: contentDetails || null,
      learning_materials: learningMaterials || null,
      practice_checks: practiceChecks || null,
    })
    .eq("id", id);

  if (error) return { error: `更新エラー: ${error.message}` };

  revalidatePath("/admin/videos");
  revalidatePath(`/admin/videos/${id}`);
  revalidatePath("/contents");
  revalidatePath(`/contents/${id}`);
  return { success: true };
}

export async function deleteVideoAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("videos").delete().eq("id", id);

  revalidatePath("/admin/videos");
  revalidatePath("/contents");
  redirect("/admin/videos?deleted=1");
}
