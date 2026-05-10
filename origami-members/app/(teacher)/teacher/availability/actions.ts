"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AvailabilityState = {
  error?: string;
  success?: string;
};

const SLOT_MINUTES = 60;

export async function addAvailabilityAction(
  _prev: AvailabilityState,
  formData: FormData
): Promise<AvailabilityState> {
  const startAtLocal = String(formData.get("start_at") ?? "").trim();
  if (!startAtLocal) return { error: "開始日時を指定してください。" };

  const startAt = new Date(startAtLocal);
  if (isNaN(startAt.getTime())) return { error: "日時形式が不正です。" };

  if (startAt.getTime() < Date.now()) {
    return { error: "過去の日時は指定できません。" };
  }

  const endAt = new Date(startAt.getTime() + SLOT_MINUTES * 60 * 1000);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "セッション切れです。" };

  const { error } = await supabase.from("teacher_availabilities").insert({
    teacher_id: user.id,
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    is_booked: false,
  });

  if (error) {
    if (error.code === "23505") return { error: "同じ時刻の枠が既に登録されています。" };
    return { error: `登録エラー: ${error.message}` };
  }

  revalidatePath("/teacher/availability");
  revalidatePath(`/teachers/${user.id}`);
  return { success: `${startAt.toLocaleString("ja-JP")} の枠を追加しました。` };
}

export async function deleteAvailabilityAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // 予約済みの枠は削除不可
  const { data: existing } = await supabase
    .from("teacher_availabilities")
    .select("is_booked, teacher_id")
    .eq("id", id)
    .maybeSingle();

  if (!existing) return;
  if (existing.teacher_id !== user.id) return; // 自分の枠のみ
  if (existing.is_booked) return;

  await supabase.from("teacher_availabilities").delete().eq("id", id);

  revalidatePath("/teacher/availability");
  revalidatePath(`/teachers/${user.id}`);
}
