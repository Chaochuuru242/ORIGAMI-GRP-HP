"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveVideoAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("videos").update({ status: "published" }).eq("id", id);

  revalidatePath("/admin/videos/pending");
  revalidatePath("/admin");
  revalidatePath("/contents");
}

export async function rejectVideoAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("videos").delete().eq("id", id);

  revalidatePath("/admin/videos/pending");
  revalidatePath("/admin");
}
