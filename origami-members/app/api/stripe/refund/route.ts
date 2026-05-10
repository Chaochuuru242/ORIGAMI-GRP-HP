/**
 * 面談予約の返金（admin 専用）
 * POST /api/stripe/refund  body: { booking_id, amount? }
 *
 * - amount 省略時は全額返金
 * - bookings.refunded_at と stripe_refund_id を更新
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const bookingId = String(body.booking_id ?? "");
  const amount = body.amount ? Number(body.amount) : undefined;
  if (!bookingId)
    return NextResponse.json({ error: "booking_id required" }, { status: 400 });

  // admin チェック
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin")
    return NextResponse.json({ error: "Admin only" }, { status: 403 });

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, stripe_payment_intent_id, refunded_at, status, price, platform_fee")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  if (booking.refunded_at)
    return NextResponse.json({ error: "Already refunded" }, { status: 409 });

  const paymentIntentId = booking.stripe_payment_intent_id as string | null;
  if (!paymentIntentId)
    return NextResponse.json(
      { error: "No Stripe payment intent associated with this booking" },
      { status: 400 }
    );

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe not configured";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount, // omit → 全額
    refund_application_fee: true, // プラットフォーム手数料も返還
    reverse_transfer: true, // 講師への送金も巻き戻し
  });

  const service = createServiceClient();
  await service
    .from("bookings")
    .update({
      refunded_at: new Date().toISOString(),
      stripe_refund_id: refund.id,
      status: "canceled",
    })
    .eq("id", bookingId);

  return NextResponse.json({ success: true, refund_id: refund.id });
}
