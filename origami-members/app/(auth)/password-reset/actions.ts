"use server";

import { createClient } from "@/lib/supabase/server";

export type ResetState = {
  error?: string;
  success?: boolean;
};

export async function passwordResetAction(
  _prev: ResetState,
  formData: FormData
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "メールアドレスを入力してください。" };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/password-update`,
  });

  if (error) return { error: `エラー: ${error.message}` };
  return { success: true };
}
