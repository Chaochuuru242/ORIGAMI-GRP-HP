/**
 * 講師の Stripe Connect Express アカウント作成 + Account Link 発行
 * POST /api/stripe/connect/onboard
 *
 * 1. teachers.stripe_account_id がなければ Stripe Connect Account 作成
 * 2. Account Link を発行して Stripe ホスト onboarding 画面へリダイレクト
 */
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/client";

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, stripe_account_id, display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (!teacher) {
    return NextResponse.json(
      { error: "You are not registered as a teacher." },
      { status: 403 }
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  let stripe;
  try {
    stripe = getStripe();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Stripe not configured";
    return NextResponse.json({ error: msg }, { status: 503 });
  }

  let accountId = teacher.stripe_account_id as string | null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      country: "JP",
      email: profile?.email as string,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: { user_id: user.id },
    });
    accountId = account.id;

    const service = createServiceClient();
    await service
      .from("teachers")
      .update({ stripe_account_id: accountId })
      .eq("id", user.id);
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/teacher/onboarding?refresh=1`,
    return_url: `${appUrl}/teacher/onboarding?completed=1`,
    type: "account_onboarding",
  });

  return NextResponse.json({ url: link.url });
}
