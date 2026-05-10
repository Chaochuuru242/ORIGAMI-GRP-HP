/**
 * サブスクの解約予約（期間末まで利用可・自動更新OFF）
 * POST /api/stripe/cancel
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const reason = String(body.reason ?? "").trim();
  const freeText = String(body.free_text ?? "").trim();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const subId = profile?.stripe_subscription_id as string | undefined;
  if (!subId) {
    return NextResponse.json(
      { error: "Active subscription not found." },
      { status: 404 }
    );
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe not configured";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  await stripe.subscriptions.update(subId, {
    cancel_at_period_end: true,
  });

  // 解約理由を記録
  if (reason) {
    const service = createServiceClient();
    await service.from("cancel_reasons").insert({
      user_id: user.id,
      reason,
      free_text: freeText || null,
    });
  }

  return NextResponse.json({ success: true });
}
