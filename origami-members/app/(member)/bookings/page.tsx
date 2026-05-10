import Link from "next/link";
import { requireCompleteProfile } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = { title: "予約一覧 | ORIGAMI GRP メンバーズ" };

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

export default async function BookingsPage() {
  const { user } = await requireCompleteProfile();
  const supabase = await createClient();

  const { data: rawBookings } = await supabase
    .from("bookings")
    .select(
      "id, start_at, end_at, status, price, teachers(display_name, photo_url)"
    )
    .eq("user_id", user.id)
    .order("start_at", { ascending: false });

  const bookings = rawBookings ?? [];

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) =>
      new Date(b.start_at as string).getTime() >= now &&
      b.status !== "canceled"
  );
  const past = bookings.filter(
    (b) =>
      new Date(b.start_at as string).getTime() < now ||
      b.status === "canceled"
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">📅 面談予約一覧</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            あなたが予約した講師との面談一覧
          </p>
        </div>
        <Button render={<Link href="/teachers" />} size="sm" variant="outline">
          講師を探す →
        </Button>
      </header>

      <section className="mb-10">
        <h2 className="mb-4 text-base font-extrabold">
          今後の予約 ({upcoming.length})
        </h2>
        {upcoming.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
            今後の予約はまだありません。
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((b) => (
              <BookingRow key={b.id as string} b={b} />
            ))}
          </div>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="mb-4 text-base font-extrabold">
            過去の予約 ({past.length})
          </h2>
          <div className="space-y-3">
            {past.map((b) => (
              <BookingRow key={b.id as string} b={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

type BookingRowData = {
  id: string;
  start_at: string;
  end_at: string;
  status: string;
  price: number;
  teachers: unknown;
};

function BookingRow({ b }: { b: BookingRowData }) {
  const start = new Date(b.start_at);
  const teacher = b.teachers as unknown as
    | { display_name?: string; photo_url?: string }
    | null;
  return (
    <Link
      href={`/bookings/${b.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
    >
      <div className="flex items-center gap-4">
        <div className="aspect-square w-12 shrink-0 overflow-hidden rounded-full bg-muted">
          {teacher?.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={teacher.photo_url}
              alt={teacher.display_name ?? ""}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-lg">
              🎓
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">
            {teacher?.display_name ?? "(講師情報なし)"} さん
          </p>
          <p className="text-xs text-muted-foreground">
            {start.toLocaleString("ja-JP", {
              dateStyle: "medium",
              timeStyle: "short",
            })}{" "}
            （60分）
          </p>
        </div>
        <div className="text-right">
          <Badge
            variant="outline"
            className={STATUS_BADGE_CLASS[b.status] ?? ""}
          >
            {STATUS_LABELS[b.status] ?? b.status}
          </Badge>
          <p className="mt-1 text-xs text-muted-foreground">
            ¥{b.price.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
