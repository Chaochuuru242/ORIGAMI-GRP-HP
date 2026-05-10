import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PLAN_NAMES, PLAN_PRICES_JPY } from "@/lib/plan/constants";

export default function PricingPage() {
  const plans = [
    {
      key: "light" as const,
      tagline: "まずは動画で学びたい方へ",
      features: ["全動画教材の視聴", "実践テンプレート配布", "週次新着動画"],
      highlight: false,
    },
    {
      key: "standard" as const,
      tagline: "学び＋相談で成果を出したい方へ",
      features: [
        "ライトの全機能",
        "講師へのチャット相談",
        "最新活用レポの優先提供",
      ],
      highlight: true,
    },
    {
      key: "premium" as const,
      tagline: "専属講師の伴走を受けたい方へ",
      features: [
        "スタンダードの全機能",
        "講師との個別面談（追加料金）",
        "非公開コンテンツへのアクセス",
      ],
      highlight: false,
    },
  ];

  return (
    <div className="mx-auto max-w-[1140px] px-6 py-16">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold sm:text-4xl">料金プラン</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          あなたの本気度と目標に合わせた、3つの実践プラン
        </p>
      </header>

      <div className="mb-8 rounded-lg border-l-4 border-primary bg-primary-light/40 p-5 text-sm text-foreground">
        <strong className="font-bold">お申し込みをご検討の方へ</strong>
        <p className="mt-1 text-xs text-muted-foreground">
          決済機能は現在準備中です。Phase 4
          で順次リリース予定。リリース時は会員ページからメール通知します。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card
            key={p.key}
            className={
              p.highlight
                ? "relative border-primary shadow-[var(--shadow-primary)]"
                : ""
            }
          >
            {p.highlight && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-3 py-1 text-xs">
                おすすめ
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-base">
                {PLAN_NAMES[p.key]}
              </CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-primary">
                  ¥{PLAN_PRICES_JPY[p.key].toLocaleString()}
                </span>
                <span className="ml-1 text-xs text-muted-foreground">
                  / 月（仮）
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="text-primary">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                render={<Link href="/register" />}
                className="mt-6 w-full"
                variant={p.highlight ? "default" : "outline"}
              >
                詳細を確認して登録する
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="mt-12 text-center text-xs text-muted-foreground">
        ※表示価格は全て税込です。決済にはクレジットカードがご利用いただけます。
        <br />
        ご不明点は <Link href="/faq" className="text-primary underline">FAQ</Link> をご確認ください。
      </p>
    </div>
  );
}
