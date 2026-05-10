import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "サポート | ORIGAMI GRP メンバーズ" };

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">💬 サポート</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          お困りの際はこちらをご確認ください
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
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

      <Card className="mt-6 border-dashed">
        <CardContent className="py-6">
          <p className="text-xs text-muted-foreground">
            ⚠ サポートメッセージ送信機能は Phase 4 で実装予定です。
            現状はサイト経由でのお問い合わせをご希望の方は{" "}
            <Link href="/faq" className="text-primary underline">
              FAQ
            </Link>{" "}
            の案内をご確認ください。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
