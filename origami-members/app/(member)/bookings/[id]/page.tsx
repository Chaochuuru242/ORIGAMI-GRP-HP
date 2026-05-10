import Link from "next/link";
import { notFound } from "next/navigation";
import { requireCompleteProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CancelForm } from "./cancel-form";

export const metadata = { title: "予約詳細 | ORIGAMI GRP メンバーズ" };

const STATUS_LABELS: Record<string, string> = {
  pending: "決済待ち",
  confirmed: "確定",
  canceled: "キャンセル済",
  completed: "完了",
  rescheduling: "再調整中",
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile } = await requireCompleteProfile();
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, user_id, teacher_id, start_at, end_at, status, price, google_meet_url, canceled_at, cancel_reason, refunded_at, teachers(display_name, photo_url)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!booking) notFound();

  const isMine = booking.user_id === user.id;
  const isMyTeaching = booking.teacher_id === user.id;
  const isAdmin = profile.role === "admin";

  if (!isMine && !isMyTeaching && !isAdmin) notFound();

  const teacher = booking.teachers as
    | { display_name?: string; photo_url?: string }
    | null;

  const start = new Date(booking.start_at as string);
  const end = new Date(booking.end_at as string);
  const status = booking.status as string;
  const meetUrl = booking.google_meet_url as string | null;
  const hoursUntilStart =
    (start.getTime() - Date.now()) / (1000 * 60 * 60);
  const canCancel =
    isMine && hoursUntilStart >= 24 && status !== "canceled" && status !== "completed";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/bookings"
        className="mb-6 inline-block text-xs text-muted-foreground hover:text-primary"
      >
        ← 予約一覧へ
      </Link>

      <header className="mb-8 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">📅 面談予約詳細</h1>
        </div>
        <Badge variant="outline" className="text-sm">
          {STATUS_LABELS[status] ?? status}
        </Badge>
      </header>

      <Card className="mb-6">
        <CardContent className="space-y-6 py-6">
          {/* 講師情報 */}
          <div className="flex items-center gap-4">
            <div className="aspect-square w-16 shrink-0 overflow-hidden rounded-full bg-muted">
              {teacher?.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={teacher.photo_url}
                  alt={teacher.display_name ?? ""}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">
                  🎓
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">講師</p>
              <p className="text-base font-extrabold">
                {teacher?.display_name ?? "(削除済み)"} さん
              </p>
              {!isMine && (
                <Link
                  href={`/teachers/${booking.teacher_id as string}`}
                  className="text-xs text-primary hover:underline"
                >
                  講師プロフィール →
                </Link>
              )}
            </div>
          </div>

          {/* 日時 */}
          <div className="grid gap-3 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">開始日時</p>
              <p className="font-bold">
                {start.toLocaleString("ja-JP", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">終了予定</p>
              <p className="font-bold">
                {end.toLocaleString("ja-JP", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">料金</p>
              <p className="font-bold">¥{(booking.price as number).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">予約番号</p>
              <p className="break-all font-mono text-xs">
                {booking.id as string}
              </p>
            </div>
          </div>

          {/* Meet リンク */}
          <div className="border-t border-border pt-6">
            <p className="mb-2 text-xs text-muted-foreground">オンライン面談リンク</p>
            {meetUrl ? (
              <Button render={<Link href={meetUrl} target="_blank" />}>
                🎥 Meet を開く
              </Button>
            ) : (
              <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                ⚠ Meet
                リンクは予約時に自動発行される予定（最終Phase で実装）。当面は講師から直接メールでお送りします。
              </div>
            )}
          </div>

          {/* キャンセル情報 */}
          {status === "canceled" && (
            <div className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground">キャンセル日時</p>
              <p className="text-sm">
                {booking.canceled_at
                  ? new Date(booking.canceled_at as string).toLocaleString(
                      "ja-JP"
                    )
                  : "—"}
              </p>
              {booking.cancel_reason && (
                <p className="mt-2 text-xs text-muted-foreground">
                  理由: {booking.cancel_reason as string}
                </p>
              )}
              {booking.refunded_at && (
                <p className="mt-2 text-xs text-emerald-700">
                  ✓ 返金処理済（
                  {new Date(booking.refunded_at as string).toLocaleDateString(
                    "ja-JP"
                  )}
                  ）
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {canCancel && (
        <Card>
          <CardContent className="py-5">
            <h3 className="mb-3 text-sm font-extrabold">予約をキャンセルする</h3>
            <p className="mb-4 text-xs text-muted-foreground">
              開始 24 時間前まで、この画面からキャンセル可能です。
              <br />
              返金は admin による手動承認が必要です。基本的にはリスケでの対応をご検討ください。
            </p>
            <CancelForm bookingId={booking.id as string} />
          </CardContent>
        </Card>
      )}

      {!canCancel &&
        isMine &&
        status !== "canceled" &&
        status !== "completed" && (
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="py-4 text-xs text-amber-800">
              開始 24 時間前を過ぎているため、Web
              からのキャンセルはできません。やむを得ない場合は{" "}
              <Link href="/support" className="font-bold underline">
                サポート
              </Link>{" "}
              にご連絡ください。
            </CardContent>
          </Card>
        )}
    </div>
  );
}
