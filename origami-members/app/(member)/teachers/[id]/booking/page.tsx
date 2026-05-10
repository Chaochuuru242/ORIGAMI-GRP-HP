import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompleteProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { isStripeReady } from "@/lib/stripe/client";
import { BookingForm, type Slot } from "./booking-form";

export const metadata = { title: "面談予約 | ORIGAMI GRP メンバーズ" };

export default async function BookingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireCompleteProfile();
  const supabase = await createClient();

  const { data: teacher } = await supabase
    .from("teachers")
    .select(
      "id, display_name, price_per_session, is_active, stripe_onboarding_completed"
    )
    .eq("id", id)
    .maybeSingle();
  if (!teacher) notFound();
  if (!teacher.is_active) notFound();

  const { data: rawSlots } = await supabase
    .from("teacher_availabilities")
    .select("id, start_at, end_at")
    .eq("teacher_id", id)
    .eq("is_booked", false)
    .gte("start_at", new Date().toISOString())
    .order("start_at", { ascending: true })
    .limit(60);

  const slots: Slot[] = (rawSlots ?? []).map((s) => ({
    id: s.id as string,
    startAt: s.start_at as string,
    endAt: s.end_at as string,
  }));

  // Stripe + 講師の Connect 完了 が両方揃ったときのみ Stripe Checkout を使う
  const useStripe =
    isStripeReady() &&
    Boolean(teacher.stripe_onboarding_completed);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href={`/teachers/${id}`}
        className="mb-6 inline-block text-xs text-muted-foreground hover:text-primary"
      >
        ← 講師プロフィールへ戻る
      </Link>

      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">📅 面談を予約する</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {teacher.display_name as string} さんとのオンライン面談（60分）
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-8">
        <BookingForm
          teacherId={id}
          slots={slots}
          pricePerSession={teacher.price_per_session as number}
          useStripe={useStripe}
        />
      </div>
    </div>
  );
}
