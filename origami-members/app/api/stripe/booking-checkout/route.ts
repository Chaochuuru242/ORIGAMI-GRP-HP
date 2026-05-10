/**
 * 面談予約用 Stripe Checkout Session 作成
 * POST /api/stripe/booking-checkout
 *   body: { teacher_id, availability_id }
 *
 * フロー：
 *   1. 空き枠ロック（is_booked=true に更新、トランザクション的に）
 *   2. bookings に status=pending で挿入
 *   3. Checkout Session 作成（mode=payment, destination=teacher.stripe_account_id, application_fee_amount=platform_fee）
 *   4. Webhook で checkout.session.completed → status=confirmed に更新
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";
import { computeFeeBreakdown } from "@/lib/booking/pricing";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const teacherId = String(body.teacher_id ?? "");
  const availabilityId = String(body.availability_id ?? "");
  if (!teacherId || !availabilityId) {
    return NextResponse.json(
      { error: "teacher_id and availability_id are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 講師情報
  const { data: teacher } = await supabase
    .from("teachers")
    .select(
      "id, price_per_session, platform_fee_rate, is_active, stripe_account_id, stripe_onboarding_completed, display_name"
    )
    .eq("id", teacherId)
    .maybeSingle();
  if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
  if (!teacher.is_active)
    return NextResponse.json({ error: "Teacher not accepting bookings" }, { status: 400 });
  if (!teacher.stripe_onboarding_completed)
    return NextResponse.json(
      { error: "Teacher has not completed Stripe onboarding" },
      { status: 400 }
    );

  // 空き枠
  const { data: slot } = await supabase
    .from("teacher_availabilities")
    .select("id, teacher_id, start_at, end_at, is_booked")
    .eq("id", availabilityId)
    .maybeSingle();
  if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });
  if (slot.teacher_id !== teacherId)
    return NextResponse.json({ error: "Slot does not belong to teacher" }, { status: 400 });
  if (slot.is_booked)
    return NextResponse.json({ error: "Slot already booked" }, { status: 409 });

  // 手数料率
  let feeRate = teacher.platform_fee_rate as number | null;
  if (feeRate === null) {
    const { data: setting } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "platform_fee_rate_default")
      .maybeSingle();
    feeRate = (setting?.value as number) ?? 0.2;
  }

  const { price, platformFee, teacherPayout } = computeFeeBreakdown({
    price: teacher.price_per_session as number,
    feeRate,
  });

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe not configured";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const service = createServiceClient();

  // 予約を pending で挿入
  const { data: bookingRow, error: bookingErr } = await service
    .from("bookings")
    .insert({
      user_id: user.id,
      teacher_id: teacherId,
      availability_id: availabilityId,
      start_at: slot.start_at,
      end_at: slot.end_at,
      status: "pending",
      price,
      platform_fee: platformFee,
      teacher_payout: teacherPayout,
    })
    .select("id")
    .single();
  if (bookingErr)
    return NextResponse.json(
      { error: `Booking error: ${bookingErr.message}` },
      { status: 500 }
    );

  // 空き枠ロック
  await service
    .from("teacher_availabilities")
    .update({ is_booked: true })
    .eq("id", availabilityId);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "jpy",
          unit_amount: price,
          product_data: {
            name: `${teacher.display_name} さんとの 60分面談`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFee,
      transfer_data: {
        destination: teacher.stripe_account_id as string,
      },
      metadata: {
        booking_id: bookingRow.id as string,
        teacher_id: teacherId,
        user_id: user.id,
      },
    },
    metadata: {
      booking_id: bookingRow.id as string,
      teacher_id: teacherId,
      user_id: user.id,
    },
    success_url: `${appUrl}/bookings/${bookingRow.id}?success=1`,
    cancel_url: `${appUrl}/teachers/${teacherId}/booking?canceled=1&booking_id=${bookingRow.id}`,
    locale: "ja",
  });

  return NextResponse.json({ url: session.url });
}
