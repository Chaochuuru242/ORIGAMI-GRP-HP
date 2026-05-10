import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PLAN_NAMES, ROLE_NAMES, PLANS, ROLES } from "@/lib/plan/constants";
import { updateUserRoleAndPlanAction } from "./actions";

export const metadata = { title: "ユーザー管理 | Admin" };

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string; plan?: string }>;
}) {
  const { q, role, plan } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, plan, subscription_status, current_period_end, created_at"
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (role) query = query.eq("role", role);
  if (plan) query = query.eq("plan", plan);
  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data: rawUsers } = await query;
  const users = rawUsers ?? [];

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold">👥 ユーザー管理</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ロール・プランの手動変更（緊急対応用）
        </p>
      </header>

      <form
        method="GET"
        className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[2fr_1fr_1fr_auto]"
      >
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder="氏名 or メアドで検索..."
          className="text-sm"
        />
        <select
          name="role"
          defaultValue={role ?? ""}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="">全ロール</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_NAMES[r]}
            </option>
          ))}
        </select>
        <select
          name="plan"
          defaultValue={plan ?? ""}
          className="h-9 rounded-md border border-border bg-background px-2 text-sm"
        >
          <option value="">全プラン</option>
          {PLANS.map((p) => (
            <option key={p} value={p}>
              {PLAN_NAMES[p]}
            </option>
          ))}
        </select>
        <Button type="submit" size="sm">
          🔍 絞り込む
        </Button>
      </form>

      <p className="mb-3 text-xs text-muted-foreground">
        該当ユーザー：<strong className="text-foreground">{users.length}</strong>{" "}
        人（最大200件）
      </p>

      {/* HTML仕様で <tr> 内に <form> を入れられないため、行ごとの form をテーブル外に置き form 属性で紐付ける */}
      {users.map((u) => (
        <form
          key={`form-${u.id as string}`}
          id={`user-form-${u.id as string}`}
          action={updateUserRoleAndPlanAction}
          style={{ display: "none" }}
        >
          <input type="hidden" name="id" value={u.id as string} />
        </form>
      ))}

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30 text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                氏名 / 登録日
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                メール
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                ロール
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                プラン
              </th>
              <th className="px-4 py-3 text-left font-bold text-muted-foreground">
                サブスク
              </th>
              <th className="px-4 py-3 text-right font-bold text-muted-foreground">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  該当するユーザーがいません
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const formId = `user-form-${u.id as string}`;
                return (
                  <tr
                    key={u.id as string}
                    className="border-b border-border last:border-0"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-foreground">
                        {(u.full_name as string) ?? "(未設定)"}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {new Date(u.created_at as string).toLocaleDateString(
                          "ja-JP"
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.email as string}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        name="role"
                        form={formId}
                        defaultValue={u.role as string}
                        className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_NAMES[r]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        name="plan"
                        form={formId}
                        defaultValue={u.plan as string}
                        className="h-8 rounded-md border border-border bg-background px-2 text-sm"
                      >
                        {PLANS.map((p) => (
                          <option key={p} value={p}>
                            {PLAN_NAMES[p]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {u.subscription_status ? (
                        <>
                          <div>{u.subscription_status as string}</div>
                          {u.current_period_end && (
                            <div className="text-[10px]">
                              期間末:{" "}
                              {new Date(
                                u.current_period_end as string
                              ).toLocaleDateString("ja-JP")}
                            </div>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="submit"
                        form={formId}
                        size="sm"
                        variant="outline"
                      >
                        更新
                      </Button>
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
