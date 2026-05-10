"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = {
  error?: string;
  success?: boolean;
};

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const fullNameKana = String(formData.get("full_name_kana") ?? "").trim();
  const fullNameEnglish = String(
    formData.get("full_name_english") ?? ""
  ).trim();

  if (!fullName || !fullNameKana || !fullNameEnglish) {
    return { error: "全ての項目を入力してください。" };
  }

  // 英語表記は半角スペースを含むこと（姓名）
  if (!/\S+\s+\S+/.test(fullNameEnglish)) {
    return {
      error: "英語表記は「FirstName LastName」形式で入力してください。",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインセッションが切れました。" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      full_name_kana: fullNameKana,
      full_name_english: fullNameEnglish,
    })
    .eq("id", user.id);

  if (error) return { error: `更新エラー: ${error.message}` };

  // メタデータ側も同期
  await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      full_name_kana: fullNameKana,
      full_name_english: fullNameEnglish,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
