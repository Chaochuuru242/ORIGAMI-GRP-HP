import { redirect } from "next/navigation";
import { requireTeacherOrAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { TeacherProfileForm } from "./teacher-profile-form";

export const metadata = { title: "講師プロフィール編集 | ORIGAMI GRP" };

export default async function TeacherProfilePage() {
  const { user } = await requireTeacherOrAdmin();
  const supabase = await createClient();

  const { data: teacher } = await supabase
    .from("teachers")
    .select(
      "id, display_name, bio, photo_url, specialties, price_per_session, is_active"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (!teacher) {
    // admin だが teachers レコードなし
    redirect("/teacher/dashboard?error=not_a_teacher");
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">🎓 講師プロフィール編集</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ユーザーが講師カードでこの情報を見て予約を判断します
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-8">
        <TeacherProfileForm
          displayName={(teacher.display_name as string) ?? ""}
          bio={(teacher.bio as string) ?? ""}
          photoUrl={(teacher.photo_url as string) ?? ""}
          specialties={(teacher.specialties as string[]) ?? []}
          pricePerSession={(teacher.price_per_session as number) ?? 0}
          isActive={(teacher.is_active as boolean) ?? false}
        />
      </div>
    </div>
  );
}
