/**
 * Stripe Price ID とアプリ内プラン名のマッピング
 *
 * .env.local で各 Price ID を設定すると Stripe Subscription とリンクされる
 *   STRIPE_PRICE_LIGHT=price_xxx
 *   STRIPE_PRICE_STANDARD=price_xxx
 *   STRIPE_PRICE_PREMIUM=price_xxx
 */
import type { Plan } from "@/lib/plan/constants";

export type PaidPlan = Exclude<Plan, "free">;

export function getStripePriceId(plan: PaidPlan): string {
  const map: Record<PaidPlan, string | undefined> = {
    light: process.env.STRIPE_PRICE_LIGHT,
    standard: process.env.STRIPE_PRICE_STANDARD,
    premium: process.env.STRIPE_PRICE_PREMIUM,
  };
  const id = map[plan];
  if (!id) {
    throw new Error(
      `Stripe Price ID for plan "${plan}" is not configured. Set STRIPE_PRICE_${plan.toUpperCase()} in .env.local`
    );
  }
  return id;
}

export function planFromPriceId(priceId: string): PaidPlan | null {
  if (priceId === process.env.STRIPE_PRICE_LIGHT) return "light";
  if (priceId === process.env.STRIPE_PRICE_STANDARD) return "standard";
  if (priceId === process.env.STRIPE_PRICE_PREMIUM) return "premium";
  return null;
}
