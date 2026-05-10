"use server";

import { createClient } from "@/lib/supabase/server";

/** 視聴履歴を1件記録（3分経過後にクライアントから呼ぶ） */
export async function recordViewAction(videoId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("video_views")
    .insert({ video_id: videoId, user_id: user.id });
}

/** 資料DLを1件記録 */
export async function recordDownloadAction(
  videoId: string,
  materialType: "learning_materials" | "practice_checks"
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("video_downloads").insert({
    video_id: videoId,
    user_id: user.id,
    material_type: materialType,
  });
}
