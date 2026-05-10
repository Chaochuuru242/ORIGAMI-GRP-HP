import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefundButton } from "./refund-button";

export const metadata = { title: "予約管理 | Admin" };

const STATUS_LABELS: Record<string, string> = {
  pending: "決済待ち",
  confirmed: "確定",
  canceled: "キャンセル済",
  completed: "完了",
  rescheduling: "再調整中",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  confirmed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  canceled: "border-zinc-200 bg-zinc-50 text-zinc-600",
  completed: "border-sky-200 bg-sky-50 text-sky-700",
  rescheduling: "border-amber-200 bg-amber-50 text-amber-700",
};

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: rawBookings } = await supabase
    .from("bookings")
    .select(
      "id, start_at, end_at, status, price, platform_fee, teacher_payout, canceled_at, refunded_at, stripe_payment_intent_id, profiles(full_name, email), teachers(display_name)"
    )
    .order("start_at", { ascending: false })
    .limit(200);

  const bookings = rawBookings ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">📅 予約管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          全予約の一覧（直近200件）
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          ⚠ 返金処理（Stripe Refund）は Phase 4 で実装予定。当面は手動で銀行振込・調整をお願いします。
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                日時
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                ユーザー
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                講師
              </th>
              <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                料金 / 内訳
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                状態
              </th>
              <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                詳細
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  まだ予約がありません
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const u = b.profiles as { full_name?: string; email?: string } | null;
                const t = b.teachers as { display_name?: string } | null;
                const status = b.status as string;
                return (
                  <tr
                    key={b.id as string}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3 text-xs">
                      {new Date(b.start_at as string).toLocaleString("ja-JP", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-bold">{u?.full_name ?? "—"}</div>
                      <div className="text-muted-foreground">{u?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-bold">
                      {t?.display_name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      <div className="font-bold">
                        ¥{(b.price as number).toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        運営: ¥{(b.platform_fee as number).toLocaleString()} /
                        講師: ¥{(b.teacher_payout as number).toLocaleString()}
                      </div>
                      {b.refunded_at && (
                        <div className="text-[10px] text-emerald-700">
                          ✓ 返金済
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={STATUS_BADGE_CLASS[status] ?? ""}
                      >
                        {STATUS_LABELS[status] ?? status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {b.stripe_payment_intent_id &&
                          !b.refunded_at &&
                          status !== "canceled" && (
                            <RefundButton bookingId={b.id as string} />
                          )}
                        <Button
                          render={<Link href={`/bookings/${b.id as string}`} />}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                        >
                          →
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
