/**
 * Server-side Stripe SDK の初期化
 * Webhook / Checkout Session 作成 / Customer Portal などで使用
 *
 * ⚠ 環境変数が未設定の状態でも import できるよう、初回呼び出し時に lazy 初期化
 */
import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set in environment variables. Stripe features are disabled."
    );
  }

  _stripe = new Stripe(secretKey, {
    apiVersion: "2026-04-22.dahlia",
    typescript: true,
  });
  return _stripe;
}

/** Stripe が利用可能かのチェック（UI 制御用） */
export function isStripeReady(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
