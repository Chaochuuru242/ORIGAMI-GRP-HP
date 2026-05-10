import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PromoteForm } from "./promote-form";
import {
  updateTeacherActiveAction,
  updateTeacherFeeAction,
  removeTeacherAction,
} from "./actions";

export const metadata = { title: "講師管理 | Admin" };

export default async function AdminTeachersPage() {
  const supabase = await createClient();

  const { data: rawTeachers } = await supabase
    .from("teachers")
    .select(
      "id, display_name, price_per_session, is_active, platform_fee_rate, stripe_onboarding_completed, invited_at, profiles(email, full_name)"
    )
    .order("invited_at", { ascending: false });

  const teachers = rawTeachers ?? [];

  const teacherIds = teachers.map((t) => t.id as string);
  const { data: candidateProfiles } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .neq("role", "teacher")
    .neq("role", "admin")
    .order("created_at", { ascending: false })
    .limit(100);

  const candidates = (candidateProfiles ?? [])
    .filter((p) => !teacherIds.includes(p.id as string))
    .map((p) => ({
      id: p.id as string,
      full_name: p.full_name as string | null,
      email: p.email as string,
    }));

  const { data: feeSetting } = await supabase
    .from("platform_settings")
    .select("value")
    .eq("key", "platform_fee_rate_default")
    .maybeSingle();
  const defaultFee = (feeSetting?.value as number) ?? 0.2;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">🎓 講師管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          講師の登録・公開／非公開切替・手数料率設定
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          ⚠ Stripe Connect 接続（決済受け取り）は最終 Phase で実装予定。現状は登録・公開のみ可能。
        </p>
      </header>

      <section className="mb-10 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-base font-extrabold">
          既存ユーザーを講師に登録
        </h2>
        <PromoteForm candidates={candidates} />
      </section>

      <section>
        <h2 className="mb-4 text-base font-extrabold">
          登録済み講師 ({teachers.length}人)
        </h2>
        {teachers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
            まだ講師が登録されていません。
          </div>
        ) : (
          <div className="space-y-3">
            {teachers.map((t) => {
              const profile = t.profiles as
                | { email?: string; full_name?: string }
                | null;
              const isActive = t.is_active as boolean;
              const stripeReady = t.stripe_onboarding_completed as boolean;
              const feeRate = t.platform_fee_rate as number | null;
              return (
                <div
                  key={t.id as string}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold">
                          {t.display_name as string}
                        </span>
                        {isActive ? (
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
                            公開中
                          </Badge>
                        ) : (
                          <Badge variant="outline">非公開</Badge>
                        )}
                        {stripeReady ? (
                          <Badge className="border-sky-200 bg-sky-50 text-sky-700">
                            Stripe接続済
                          </Badge>
                        ) : (
                          <Badge variant="outline">Stripe未接続</Badge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold">
                        ¥{(t.price_per_session as number).toLocaleString()}
                        <span className="ml-1 text-[10px] font-normal text-muted-foreground">
                          /60分
                        </span>
                      </p>
                      {t.invited_at && (
                        <p className="text-[10px] text-muted-foreground">
                          登録:{" "}
                          {new Date(
                            t.invited_at as string
                          ).toLocaleDateString("ja-JP")}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-3 border-t border-border pt-3 sm:grid-cols-3">
                    <form
                      action={updateTeacherActiveAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={t.id as string} />
                      <input
                        type="hidden"
                        name="is_active"
                        value={(!isActive).toString()}
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        {isActive ? "非公開にする" : "公開する"}
                      </Button>
                    </form>

                    <form
                      action={updateTeacherFeeAction}
                      className="flex items-center gap-2"
                    >
                      <input type="hidden" name="id" value={t.id as string} />
                      <Input
                        type="number"
                        name="platform_fee_rate"
                        step="0.01"
                        min="0"
                        max="1"
                        defaultValue={feeRate ?? ""}
                        placeholder={`デフォルト ${defaultFee}`}
                        className="h-8 text-xs"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="outline"
                        className="text-xs"
                      >
                        手数料率
                      </Button>
                    </form>

                    <div className="flex items-center justify-end gap-2">
                      <Button
                        render={<Link href={`/teachers/${t.id as string}`} />}
                        size="sm"
                        variant="ghost"
                        className="text-xs"
                      >
                        公開ページ →
                      </Button>
                      <form action={removeTeacherAction}>
                        <input type="hidden" name="id" value={t.id as string} />
                        <Button
                          type="submit"
                          size="sm"
                          variant="destructive"
                          className="text-xs"
                        >
                          講師解除
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
