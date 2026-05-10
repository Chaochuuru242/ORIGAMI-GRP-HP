"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TARGET_PLANS, type TargetPlan } from "@/lib/plan/constants";

export type UploadState = {
  error?: string;
};

export async function uploadVideoAction(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const videoUrl = String(formData.get("video_url") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim();
  const targetPlan = String(formData.get("target_plan") ?? "all").trim();
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const contentDetails = String(formData.get("content_details") ?? "").trim();
  const learningMaterials = String(
    formData.get("learning_materials") ?? ""
  ).trim();
  const practiceChecks = String(formData.get("practice_checks") ?? "").trim();

  if (!title || !videoUrl) {
    return { error: "タイトル・動画URLは必須です。" };
  }
  if (!TARGET_PLANS.includes(targetPlan as TargetPlan)) {
    return { error: "対象プランの値が不正です。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "セッション切れです。再ログインしてください。" };

  const { error } = await supabase.from("videos").insert({
    title,
    description: description || null,
    video_url: videoUrl,
    thumbnail_url: thumbnailUrl || null,
    target_plan: targetPlan,
    category_id: categoryId || null,
    content_details: contentDetails || null,
    learning_materials: learningMaterials || null,
    practice_checks: practiceChecks || null,
    status: "pending",
    created_by: user.id,
  });

  if (error) return { error: `登録エラー: ${error.message}` };

  redirect("/upload?success=1");
}
