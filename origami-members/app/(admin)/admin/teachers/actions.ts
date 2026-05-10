"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type InviteState = {
  error?: string;
  success?: string;
};

/**
 * 既存ユーザーを講師として登録する
 * 1. profiles.role を 'teacher' に変更
 * 2. teachers テーブルに行を作成（display_name は profiles.full_name から）
 */
export async function promoteUserToTeacherAction(
  _prev: InviteState,
  formData: FormData
): Promise<InviteState> {
  const userId = String(formData.get("user_id") ?? "").trim();
  const displayName = String(formData.get("display_name") ?? "").trim();
  const pricePerSession = Number(formData.get("price_per_session") ?? 0);

  if (!userId) return { error: "ユーザーを選択してください。" };
  if (!displayName) return { error: "表示名は必須です。" };
  if (pricePerSession < 0)
    return { error: "面談料金は 0 以上の数値を入力してください。" };

  const supabase = await createClient();

  // 既に teachers に登録されているかチェック
  const { data: existing } = await supabase
    .from("teachers")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (existing) {
    return { error: "このユーザーは既に講師として登録されています。" };
  }

  // role を teacher に
  const { error: profileErr } = await supabase
    .from("profiles")
    .update({ role: "teacher" })
    .eq("id", userId);

  if (profileErr) return { error: `プロフィール更新エラー: ${profileErr.message}` };

  // teachers に挿入
  const { error: teacherErr } = await supabase.from("teachers").insert({
    id: userId,
    display_name: displayName,
    price_per_session: pricePerSession,
    is_active: false, // 初期は非公開（講師がプロフィール完成後に公開）
    invited_at: new Date().toISOString(),
  });

  if (teacherErr) return { error: `講師登録エラー: ${teacherErr.message}` };

  revalidatePath("/admin/teachers");
  return { success: `${displayName} さんを講師として登録しました。` };
}

export async function updateTeacherActiveAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("is_active") ?? "false") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("teachers").update({ is_active: isActive }).eq("id", id);

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
}

export async function updateTeacherFeeAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const rateStr = String(formData.get("platform_fee_rate") ?? "").trim();

  if (!id) return;

  const rate = rateStr === "" ? null : Number(rateStr);
  if (rate !== null && (isNaN(rate) || rate < 0 || rate > 1)) return;

  const supabase = await createClient();
  await supabase
    .from("teachers")
    .update({ platform_fee_rate: rate })
    .eq("id", id);

  revalidatePath("/admin/teachers");
}

export async function removeTeacherAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();

  // teachers レコード削除
  await supabase.from("teachers").delete().eq("id", id);
  // role を user に戻す
  await supabase.from("profiles").update({ role: "user" }).eq("id", id);

  revalidatePath("/admin/teachers");
  redirect("/admin/teachers");
}
