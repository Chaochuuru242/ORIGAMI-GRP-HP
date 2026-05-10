/**
 * Server Components 用の認証・ロールガード
 * 失敗時は redirect() で他画面に飛ばす
 */
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Plan, Role } from "@/lib/plan/constants";

export type UserProfile = {
  id: string;
  email: string;
  full_name: string | null;
  full_name_kana: string | null;
  full_name_english: string | null;
  role: Role;
  plan: Plan;
  stripe_customer_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

/**
 * ログイン必須。未ログインなら /login へ。
 * プロフィール未設定（フリガナ or 英語表記が空）なら /profile へ。
 */
export async function requireUser(): Promise<{
  user: { id: string; email: string };
  profile: UserProfile;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, full_name_kana, full_name_english, role, plan, stripe_customer_id, subscription_status, current_period_end, cancel_at_period_end"
    )
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return {
    user: { id: user.id, email: user.email ?? "" },
    profile: profile as UserProfile,
  };
}

/**
 * プロフィール完了必須（フリガナ or 英語表記が未設定なら /profile へ）
 */
export async function requireCompleteProfile() {
  const { user, profile } = await requireUser();

  const incomplete =
    !profile.full_name_kana ||
    profile.full_name_kana === "未設定" ||
    !profile.full_name_english ||
    profile.full_name_english === "未設定";

  if (incomplete) {
    redirect("/profile?incomplete=1");
  }

  return { user, profile };
}

/** adder または admin が必要 */
export async function requireAdderOrAdmin() {
  const result = await requireUser();
  if (result.profile.role !== "adder" && result.profile.role !== "admin") {
    redirect("/dashboard?error=not_allowed");
  }
  return result;
}

/** admin が必要 */
export async function requireAdmin() {
  const result = await requireUser();
  if (result.profile.role !== "admin") {
    redirect("/dashboard?error=not_allowed");
  }
  return result;
}

/** teacher または admin が必要 */
export async function requireTeacherOrAdmin() {
  const result = await requireUser();
  if (result.profile.role !== "teacher" && result.profile.role !== "admin") {
    redirect("/dashboard?error=not_allowed");
  }
  return result;
}
