"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TARGET_PLANS, type TargetPlan } from "@/lib/plan/constants";

export type PlaylistState = {
  error?: string;
  success?: string;
};

export async function createPlaylistAction(
  _prev: PlaylistState,
  formData: FormData
): Promise<PlaylistState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim();
  const targetPlan = String(formData.get("target_plan") ?? "all").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!title) return { error: "タイトルは必須です。" };
  if (!TARGET_PLANS.includes(targetPlan as TargetPlan))
    return { error: "対象プランの値が不正です。" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("playlists")
    .insert({
      title,
      description: description || null,
      thumbnail_url: thumbnailUrl || null,
      target_plan: targetPlan,
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) return { error: `登録エラー: ${error.message}` };

  revalidatePath("/admin/playlists");
  redirect(`/admin/playlists/${data.id as string}`);
}

export async function updatePlaylistAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const thumbnailUrl = String(formData.get("thumbnail_url") ?? "").trim();
  const targetPlan = String(formData.get("target_plan") ?? "all").trim();
  const sortOrder = Number(formData.get("sort_order") ?? 0);

  if (!id || !title) return;
  if (!TARGET_PLANS.includes(targetPlan as TargetPlan)) return;

  const supabase = await createClient();
  await supabase
    .from("playlists")
    .update({
      title,
      description: description || null,
      thumbnail_url: thumbnailUrl || null,
      target_plan: targetPlan,
      sort_order: sortOrder,
    })
    .eq("id", id);

  revalidatePath("/admin/playlists");
  revalidatePath(`/admin/playlists/${id}`);
  revalidatePath("/playlists");
}

export async function deletePlaylistAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("playlists").delete().eq("id", id);

  revalidatePath("/admin/playlists");
  redirect("/admin/playlists");
}

export async function addVideoToPlaylistAction(formData: FormData) {
  const playlistId = String(formData.get("playlist_id") ?? "");
  const videoId = String(formData.get("video_id") ?? "");
  if (!playlistId || !videoId) return;

  const supabase = await createClient();

  // 現在の最大 position を取得して +10 で末尾に追加
  const { data: maxRow } = await supabase
    .from("playlist_videos")
    .select("position")
    .eq("playlist_id", playlistId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (maxRow?.position ?? 0) + 10;

  await supabase.from("playlist_videos").insert({
    playlist_id: playlistId,
    video_id: videoId,
    position: nextPosition,
  });

  revalidatePath(`/admin/playlists/${playlistId}`);
  revalidatePath(`/playlists/${playlistId}`);
}

export async function removeVideoFromPlaylistAction(formData: FormData) {
  const playlistId = String(formData.get("playlist_id") ?? "");
  const videoId = String(formData.get("video_id") ?? "");
  if (!playlistId || !videoId) return;

  const supabase = await createClient();
  await supabase
    .from("playlist_videos")
    .delete()
    .eq("playlist_id", playlistId)
    .eq("video_id", videoId);

  revalidatePath(`/admin/playlists/${playlistId}`);
  revalidatePath(`/playlists/${playlistId}`);
}

export async function updateVideoPositionAction(formData: FormData) {
  const playlistId = String(formData.get("playlist_id") ?? "");
  const videoId = String(formData.get("video_id") ?? "");
  const position = Number(formData.get("position") ?? 0);
  if (!playlistId || !videoId) return;

  const supabase = await createClient();
  await supabase
    .from("playlist_videos")
    .update({ position })
    .eq("playlist_id", playlistId)
    .eq("video_id", videoId);

  revalidatePath(`/admin/playlists/${playlistId}`);
  revalidatePath(`/playlists/${playlistId}`);
}
