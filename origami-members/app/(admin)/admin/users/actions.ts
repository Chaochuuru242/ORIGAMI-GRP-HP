"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PLANS, ROLES, type Plan, type Role } from "@/lib/plan/constants";

export async function updateUserRoleAndPlanAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const role = String(formData.get("role") ?? "");
  const plan = String(formData.get("plan") ?? "");

  if (!id) return;
  if (!ROLES.includes(role as Role)) return;
  if (!PLANS.includes(plan as Plan)) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ role, plan }).eq("id", id);

  revalidatePath("/admin/users");
}
