import { requireTeacherOrAdmin } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvailabilityForm } from "./availability-form";
import { deleteAvailabilityAction } from "./actions";

export const metadata = { title: "空き時間管理 | ORIGAMI GRP" };

export default async function AvailabilityPage() {
  const { user } = await requireTeacherOrAdmin();
  const supabase = await createClient();

  const { data: rawSlots } = await supabase
    .from("teacher_availabilities")
    .select("id, start_at, end_at, is_booked")
    .eq("teacher_id", user.id)
    .order("start_at", { ascending: true });

  const now = Date.now();
  const futureSlots = (rawSlots ?? []).filter(
    (s) => new Date(s.start_at as string).getTime() >= now
  );
  const pastSlots = (rawSlots ?? []).filter(
    (s) => new Date(s.start_at as string).getTime() < now
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">📅 空き時間管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ユーザーが予約できる時間枠を登録します（60分1コマ）
        </p>
      </header>

      <section className="mb-10 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-extrabold">+ 新規枠の追加</h2>
        <AvailabilityForm />
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-base font-extrabold">
          公開中の空き枠 ({futureSlots.length}枠)
        </h2>
        {futureSlots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
            予定された空き枠がありません。上のフォームから追加してください。
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                    開始
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                    終了
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                    状態
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody>
                {futureSlots.map((s) => {
                  const start = new Date(s.start_at as string);
                  const end = new Date(s.end_at as string);
                  const isBooked = s.is_booked as boolean;
                  return (
                    <tr
                      key={s.id as string}
                      className="border-b border-border last:border-0"
                    >
                      <td className="px-4 py-3">
                        {start.toLocaleString("ja-JP", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {end.toLocaleTimeString("ja-JP", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        {isBooked ? (
                          <Badge className="border-amber-200 bg-amber-50 text-amber-700">
                            予約済
                          </Badge>
                        ) : (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            予約可能
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form action={deleteAvailabilityAction}>
                          <input type="hidden" name="id" value={s.id as string} />
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            disabled={isBooked}
                            className="text-xs"
                          >
                            削除
                          </Button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {pastSlots.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-bold text-muted-foreground">
            過去の枠 ({pastSlots.length})
          </h2>
          <details className="rounded-xl border border-border bg-card">
            <summary className="cursor-pointer px-4 py-3 text-xs text-muted-foreground">
              展開
            </summary>
            <table className="w-full text-xs">
              <tbody>
                {pastSlots.map((s) => (
                  <tr
                    key={s.id as string}
                    className="border-t border-border text-muted-foreground"
                  >
                    <td className="px-4 py-2">
                      {new Date(s.start_at as string).toLocaleString("ja-JP", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      {(s.is_booked as boolean) ? "予約済" : "未予約"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>
      )}
    </div>
  );
}
