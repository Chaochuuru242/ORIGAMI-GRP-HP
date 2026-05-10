"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SupportState = {
  error?: string;
  success?: boolean;
};

export async function sendSupportMessageAction(
  _prev: SupportState,
  formData: FormData
): Promise<SupportState> {
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "メッセージを入力してください。" };
  if (body.length > 2000)
    return { error: "メッセージは 2000 文字以内で入力してください。" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "セッション切れです。再ログインしてください。" };

  const { error } = await supabase
    .from("support_messages")
    .insert({ user_id: user.id, body });

  if (error) return { error: `送信エラー: ${error.message}` };

  revalidatePath("/support");
  return { success: true };
}
