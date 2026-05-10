/**
 * サブスクプラン購入用 Stripe Checkout Session 作成
 * POST /api/stripe/checkout  body: { plan: "light" | "standard" | "premium" }
 *
 * フロー：
 *   1. 認証ユーザー必須
 *   2. profiles.stripe_customer_id を取得 or Stripe Customer 新規作成
 *   3. Checkout Session 作成（mode=subscription、metadata.user_id を設定）
 *   4. Hosted Page URL を返却
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";
import { getStripePriceId, type PaidPlan } from "@/lib/stripe/plans";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const plan = body.plan as PaidPlan | undefined;

  if (!plan || !["light", "standard", "premium"].includes(plan)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id, email, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  let stripe;
  let priceId: string;
  try {
    stripe = getStripe();
    priceId = getStripePriceId(plan);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe not configured";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  // Customer 取得 or 新規作成
  let customerId = profile.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email as string,
      name: (profile.full_name as string) ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    const service = createServiceClient();
    await service
      .from("profiles")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { user_id: user.id, plan },
    subscription_data: {
      metadata: { user_id: user.id, plan },
    },
    success_url: `${appUrl}/account/billing?success=1`,
    cancel_url: `${appUrl}/pricing?canceled=1`,
    locale: "ja",
  });

  return NextResponse.json({ url: session.url });
}
