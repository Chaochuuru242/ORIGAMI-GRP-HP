"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type TeacherProfileState = {
  error?: string;
  success?: boolean;
};

export async function updateTeacherProfileAction(
  _prev: TeacherProfileState,
  formData: FormData
): Promise<TeacherProfileState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const photoUrl = String(formData.get("photo_url") ?? "").trim();
  const specialtiesRaw = String(formData.get("specialties") ?? "").trim();
  const pricePerSession = Number(formData.get("price_per_session") ?? 0);

  if (!displayName) return { error: "表示名は必須です。" };
  if (pricePerSession < 0) return { error: "料金は 0 以上で入力してください。" };

  const specialties = specialtiesRaw
    .split(/[,、]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "セッション切れです。再ログインしてください。" };

  const { error } = await supabase
    .from("teachers")
    .update({
      display_name: displayName,
      bio: bio || null,
      photo_url: photoUrl || null,
      specialties,
      price_per_session: pricePerSession,
    })
    .eq("id", user.id);

  if (error) return { error: `更新エラー: ${error.message}` };

  revalidatePath("/teacher/profile");
  revalidatePath("/teacher/dashboard");
  revalidatePath(`/teachers/${user.id}`);
  revalidatePath("/teachers");
  return { success: true };
}
