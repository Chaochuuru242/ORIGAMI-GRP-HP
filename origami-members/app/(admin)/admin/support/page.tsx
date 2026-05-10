import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "サポート問い合わせ | Admin" };

export default async function AdminSupportPage() {
  const supabase = await createClient();
  const { data: rawMessages } = await supabase
    .from("support_messages")
    .select("id, body, created_at, profiles(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);

  const messages = rawMessages ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">📩 サポート問い合わせ</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          ユーザーからの問い合わせ一覧（直近200件）
        </p>
        <p className="mt-2 text-[11px] text-muted-foreground">
          ⚠ 返信機能は現状なし。お返事はメールで個別対応してください。
        </p>
      </header>

      {messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center text-sm text-muted-foreground">
          まだ問い合わせはありません。
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const p = m.profiles as
              | { full_name?: string; email?: string }
              | null;
            return (
              <div
                key={m.id as string}
                className="rounded-xl border border-border bg-card p-5"
              >
                <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">
                      {p?.full_name ?? "(未設定)"}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {p?.email}
                    </p>
                  </div>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(m.created_at as string).toLocaleString("ja-JP")}
                  </span>
                </div>
                <p className="whitespace-pre-line text-sm leading-7 text-foreground">
                  {m.body as string}
                </p>
                {p?.email && (
                  <a
                    href={`mailto:${p.email}?subject=Re: ORIGAMI GRP サポート`}
                    className="mt-3 inline-block text-xs text-primary hover:underline"
                  >
                    📧 {p.email} に返信メールを開く
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
