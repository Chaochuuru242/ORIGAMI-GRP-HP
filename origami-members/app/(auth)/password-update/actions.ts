"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type UpdateState = {
  error?: string;
};

export async function passwordUpdateAction(
  _prev: UpdateState,
  formData: FormData
): Promise<UpdateState> {
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("password_confirm") ?? "");

  if (password.length < 8) {
    return { error: "パスワードは8文字以上で設定してください。" };
  }
  if (password !== confirm) {
    return { error: "確認用パスワードが一致しません。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: `更新エラー: ${error.message}` };

  redirect("/login?reset=success");
}
