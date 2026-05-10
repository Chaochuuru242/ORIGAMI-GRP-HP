/**
 * 講師の Stripe Express ダッシュボード Login Link を発行
 * POST /api/stripe/connect/dashboard
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

  const { data: teacher } = await supabase
    .from("teachers")
    .select("stripe_account_id, stripe_onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  const accountId = teacher?.stripe_account_id as string | undefined;
  if (!accountId) {
    return NextResponse.json(
      { error: "Stripe account not connected." },
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

  const link = await stripe.accounts.createLoginLink(accountId);
  return NextResponse.json({ url: link.url });
}
