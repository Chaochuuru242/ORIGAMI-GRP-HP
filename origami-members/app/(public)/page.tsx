import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-light/40 to-background">
        <div className="mx-auto max-w-[1140px] px-6 py-20 text-center md:py-28">
          <h1 className="text-3xl font-extrabold leading-tight text-foreground sm:text-4xl md:text-5xl">
            AI を稼ぐ力に変える、
            <br />
            最短ルート。
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            実践プロンプト、活用テンプレート、講師との伴走サポートを通じて、
            <br className="hidden sm:block" />
            AI 活用を仕事と成果につなげる会員限定プログラム
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              render={<Link href="/pricing" />}
              size="lg"
              className="px-8 text-base"
            >
              プランを確認する
            </Button>
            <Button
              render={<Link href="/teachers" />}
              size="lg"
              variant="outline"
              className="px-8 text-base"
            >
              講師を探す
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="mx-auto max-w-[1140px] px-6 py-16 md:py-24">
        <h2 className="mb-3 text-center text-2xl font-extrabold sm:text-3xl">
          会員限定の学習リソース
        </h2>
        <p className="mb-12 text-center text-sm text-muted-foreground sm:text-base">
          プレミアムな伴走をさらに加速させる、独自コンテンツの数々。
        </p>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📺 動画アーカイブ</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              過去の講義動画をいつでも視聴可能。プラン別に整理された学習コンテンツで、自分のペースで学べます。
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📝 実践テンプレート</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              実務ですぐに使える AI プロンプトや、業務テンプレートを配布。明日の仕事に活かせます。
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🤝 講師との面談</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              専門講師とのオンライン60分面談を都度予約。一人で詰まった課題をその場で解消できます。
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mb-16 max-w-[1140px] px-6">
        <div className="rounded-2xl bg-primary px-8 py-14 text-center text-primary-foreground">
          <h2 className="text-2xl font-extrabold sm:text-3xl">
            あなたの可能性を、
            <br />
            システムで最大化する。
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm opacity-90">
            まだ会員でない方は、まずはプラン一覧をご確認ください。
          </p>
          <Button
            render={<Link href="/pricing" />}
            size="lg"
            variant="secondary"
            className="mt-8 px-10 text-base"
          >
            プラン一覧を見る
          </Button>
        </div>
      </section>
    </>
  );
}
