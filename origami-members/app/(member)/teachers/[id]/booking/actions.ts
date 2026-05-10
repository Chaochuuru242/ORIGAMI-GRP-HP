"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { computeFeeBreakdown } from "@/lib/booking/pricing";

export type CreateBookingState = {
  error?: string;
};

/**
 * 予約作成（Phase 6 部分実装：決済なし・即時 confirmed）
 * Stripe 統合後は Checkout Session を経由する形に置き換え
 */
export async function createBookingAction(
  _prev: CreateBookingState,
  formData: FormData
): Promise<CreateBookingState> {
  const teacherId = String(formData.get("teacher_id") ?? "");
  const availabilityId = String(formData.get("availability_id") ?? "");

  if (!teacherId || !availabilityId) {
    return { error: "予約情報が不足しています。" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  // 講師情報取得
  const { data: teacher } = await supabase
    .from("teachers")
    .select("id, price_per_session, platform_fee_rate, is_active")
    .eq("id", teacherId)
    .maybeSingle();
  if (!teacher) return { error: "講師が見つかりません。" };
  if (!teacher.is_active) return { error: "この講師は現在予約を受け付けていません。" };

  // 空き枠取得
  const { data: slot } = await supabase
    .from("teacher_availabilities")
    .select("id, teacher_id, start_at, end_at, is_booked")
    .eq("id", availabilityId)
    .maybeSingle();
  if (!slot) return { error: "選択された時間枠が見つかりません。" };
  if (slot.teacher_id !== teacherId)
    return { error: "枠と講師の組み合わせが不正です。" };
  if (slot.is_booked)
    return { error: "この時間枠は既に他の方が予約しました。別の枠をお選びください。" };

  // 手数料率取得（teacher個別 → デフォルト）
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

  // RLS バイパス用 service client（is_booked 更新と bookings 挿入をアトミックに）
  const service = createServiceClient();

  // 1. 予約挿入（status=pending、Stripe決済前）
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

  if (bookingErr) return { error: `予約エラー: ${bookingErr.message}` };

  // 2. 空き枠を予約済みに
  const { error: slotErr } = await service
    .from("teacher_availabilities")
    .update({ is_booked: true })
    .eq("id", availabilityId);

  if (slotErr) {
    // ロールバック：予約レコード削除
    await service.from("bookings").delete().eq("id", bookingRow.id);
    return { error: `枠の更新エラー: ${slotErr.message}` };
  }

  // 3. ※ Phase 4 で Stripe Checkout に切り替え。当面は即 confirmed に
  await service
    .from("bookings")
    .update({ status: "confirmed" })
    .eq("id", bookingRow.id);

  revalidatePath("/bookings");
  revalidatePath(`/teachers/${teacherId}`);
  revalidatePath("/teacher/dashboard");
  redirect(`/bookings/${bookingRow.id}`);
}

export type BookingActionState = {
  error?: string;
  success?: string;
};

export async function cancelBookingAction(
  _prev: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const bookingId = String(formData.get("booking_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();
  if (!bookingId) return { error: "予約 ID が不正です。" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "ログインが必要です。" };

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, user_id, teacher_id, start_at, status, availability_id")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return { error: "予約が見つかりません。" };

  // 自分の予約 or 講師本人 のみキャンセル可
  if (booking.user_id !== user.id && booking.teacher_id !== user.id) {
    return { error: "この予約をキャンセルする権限がありません。" };
  }

  if (booking.status === "canceled" || booking.status === "completed") {
    return { error: "既にキャンセル / 完了済みの予約です。" };
  }

  // 24時間前まで
  const startMs = new Date(booking.start_at as string).getTime();
  const hoursUntilStart = (startMs - Date.now()) / (1000 * 60 * 60);
  if (hoursUntilStart < 24) {
    return {
      error:
        "開始 24 時間前を過ぎているため、Web 上ではキャンセルできません。サポートにご連絡ください。",
    };
  }

  const service = createServiceClient();

  // 予約をキャンセルに
  await service
    .from("bookings")
    .update({
      status: "canceled",
      canceled_at: new Date().toISOString(),
      canceled_by: user.id,
      cancel_reason: reason || null,
    })
    .eq("id", bookingId);

  // 空き枠を再度開放
  if (booking.availability_id) {
    await service
      .from("teacher_availabilities")
      .update({ is_booked: false })
      .eq("id", booking.availability_id as string);
  }

  revalidatePath("/bookings");
  revalidatePath(`/bookings/${bookingId}`);
  revalidatePath("/teacher/dashboard");
  return { success: "予約をキャンセルしました。" };
}
