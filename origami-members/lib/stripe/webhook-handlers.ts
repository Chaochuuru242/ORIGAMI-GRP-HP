/**
 * Stripe Webhook イベントハンドラ
 * /api/stripe/webhook から呼ばれる
 *
 * 冪等性に注意：同じ event.id が複数回届くことがあるため、
 * すべての更新は upsert / 状態確認 / べき等な操作にすること
 */
import type Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";
import { planFromPriceId } from "./plans";

/** checkout.session.completed: 新規サブスク or 面談予約決済の完了 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  const mode = session.mode;
  const supabase = createServiceClient();

  // === サブスク購入 ===
  if (mode === "subscription") {
    const userId = session.metadata?.user_id;
    if (!userId) {
      console.error("checkout.session.completed: missing user_id in metadata");
      return;
    }
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    await supabase
      .from("profiles")
      .update({
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        subscription_status: "active",
      })
      .eq("id", userId);
    return;
  }

  // === 面談予約決済 ===
  if (mode === "payment") {
    const bookingId = session.metadata?.booking_id;
    if (!bookingId) return;
    const paymentIntentId = session.payment_intent as string;
    await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        stripe_payment_intent_id: paymentIntentId,
      })
      .eq("id", bookingId);
    return;
  }
}

/** customer.subscription.updated: プラン変更 / 期間更新 / 解約予約等 */
export async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription
) {
  const supabase = createServiceClient();
  const customerId = subscription.customer as string;

  const item = subscription.items.data[0];
  const priceId = item?.price.id;
  const plan = priceId ? planFromPriceId(priceId) : null;

  await supabase
    .from("profiles")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: new Date(
        // @ts-expect-error - Stripe types may not include current_period_end here
        (subscription.current_period_end ?? 0) * 1000
      ).toISOString(),
      ...(plan ? { plan } : {}),
    })
    .eq("stripe_customer_id", customerId);
}

/** customer.subscription.deleted: 解約完了 → free に降格 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const supabase = createServiceClient();
  const customerId = subscription.customer as string;

  await supabase
    .from("profiles")
    .update({
      plan: "free",
      subscription_status: "canceled",
      stripe_subscription_id: null,
      cancel_at_period_end: false,
    })
    .eq("stripe_customer_id", customerId);
}

/** invoice.payment_failed: 決済失敗 → notify or downgrade */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = createServiceClient();
  const customerId = invoice.customer as string;

  await supabase
    .from("profiles")
    .update({ subscription_status: "past_due" })
    .eq("stripe_customer_id", customerId);
}

/** Stripe Connect: アカウント更新（KYC 完了等） */
export async function handleAccountUpdated(account: Stripe.Account) {
  const supabase = createServiceClient();
  const completed = Boolean(
    account.charges_enabled && account.payouts_enabled && account.details_submitted
  );

  await supabase
    .from("teachers")
    .update({ stripe_onboarding_completed: completed })
    .eq("stripe_account_id", account.id);
}
