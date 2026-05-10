/**
 * 解約予約の取り消し（自動更新を再開）
 * POST /api/stripe/resume
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    cancel_at_period_end: false,
  });

  return NextResponse.json({ success: true });
}
