import { createClient } from "@/lib/supabase/server";
import { TeachersClient } from "./teachers-client";
import type { TeacherCardProps } from "@/components/teacher/teacher-card";

export const metadata = { title: "講師を探す | ORIGAMI GRP メンバーズ" };

export default async function TeachersListPage() {
  const supabase = await createClient();

  const { data: rawTeachers } = await supabase
    .from("teachers")
    .select(
      "id, display_name, bio, photo_url, specialties, price_per_session, stripe_onboarding_completed"
    )
    .eq("is_active", true)
    .order("display_name", { ascending: true });

  const teachers: TeacherCardProps[] = (rawTeachers ?? []).map((t) => ({
    id: t.id as string,
    displayName: t.display_name as string,
    bio: (t.bio as string) ?? null,
    photoUrl: (t.photo_url as string) ?? null,
    specialties: (t.specialties as string[]) ?? [],
    pricePerSession: t.price_per_session as number,
    stripeReady: (t.stripe_onboarding_completed as boolean) ?? false,
  }));

  const specialtySet = new Set<string>();
  for (const t of teachers) {
    for (const s of t.specialties) specialtySet.add(s);
  }
  const allSpecialties = Array.from(specialtySet).sort();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">🤝 講師を探す</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI 活用のプロから 60 分のオンライン面談で個別サポートを受けられます
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          ※ 予約・決済機能は現在準備中。Phase 6 でリリース予定です。
        </p>
      </header>

      <TeachersClient teachers={teachers} allSpecialties={allSpecialties} />
    </div>
  );
}
