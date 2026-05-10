import Link from "next/link";
import { requireUser } from "@/lib/auth/guards";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SupportForm } from "./support-form";

export const metadata = { title: "サポート | ORIGAMI GRP メンバーズ" };

export default async function SupportPage() {
  const { user } = await requireUser();
  const supabase = await createClient();

  const { data: rawHistory } = await supabase
    .from("support_messages")
    .select("id, body, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const history = rawHistory ?? [];

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">💬 サポート</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          お困りの際はこちらをご確認ください
        </p>
      </header>

      <div className="mb-8 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📚 よくある質問</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              プラン・決済・動画視聴など、よくある質問への回答を掲載しています。
            </p>
            <Button render={<Link href="/faq" />} variant="outline">
              FAQ を見る
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">🤝 講師に相談する</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              個別の課題は講師との 60 分面談で直接解決できます。
            </p>
            <Button render={<Link href="/teachers" />} variant="outline">
              講師を探す
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-base">📩 サポートに問い合わせる</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-5 text-xs text-muted-foreground">
            運営サポートチームへ直接ご質問・ご要望をお送りいただけます。通常 1 営業日以内にメールでお返事します。
          </p>
          <SupportForm />
        </CardContent>
      </Card>

      {history.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-extrabold">
            過去の問い合わせ履歴 ({history.length})
          </h2>
          <div className="space-y-2">
            {history.map((m) => (
              <div
                key={m.id as string}
                className="rounded-lg border border-border bg-card p-3 text-sm"
              >
                <p className="text-[10px] text-muted-foreground">
                  {new Date(m.created_at as string).toLocaleString("ja-JP")}
                </p>
                <p className="mt-1 whitespace-pre-line text-xs text-foreground">
                  {m.body as string}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
