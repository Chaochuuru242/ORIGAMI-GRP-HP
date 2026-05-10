"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type DeleteState = {
  error?: string;
};

export async function deleteAccountAction(
  _prev: DeleteState,
  formData: FormData
): Promise<DeleteState> {
  const confirmText = String(formData.get("confirm_text") ?? "").trim();
  if (confirmText !== "退会します") {
    return { error: "確認テキストが一致しません。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "セッション切れです。" };

  // 解約後の free ユーザーのみ削除可
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if (profile?.plan !== "free") {
    return {
      error: "有料プラン解約後の無料会員のみ退会できます。先に解約してください。",
    };
  }

  // ソフトデリート（30日後の物理削除を別途バッチで予定）
  const service = createServiceClient();
  await service
    .from("profiles")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", user.id);

  // セッション破棄
  await supabase.auth.signOut();

  redirect("/?deleted=1");
}
