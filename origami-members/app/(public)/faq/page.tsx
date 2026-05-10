export default function FaqPage() {
  const faqs = [
    {
      q: "プラン変更はいつでもできますか？",
      a: "可能です。お支払い・プラン画面から、いつでもアップグレード・ダウングレードできます。アップグレードは即時反映、ダウングレードは次回更新日から適用されます。",
    },
    {
      q: "解約はどうやってしますか？",
      a: "お支払い・プラン画面の「解約」ボタンから手続きできます。解約後も契約期間終了までは引き続きコンテンツを視聴できます。",
    },
    {
      q: "動画の本数はどれくらいありますか？",
      a: "新規動画は毎週更新しています。プランごとに視聴可能なコンテンツが異なります。詳細はコンテンツ一覧でご確認ください。",
    },
    {
      q: "講師との面談はどのプランで利用できますか？",
      a: "面談機能は全プランの会員が予約可能です。料金は講師ごとに設定されており、都度決済となります。",
    },
    {
      q: "支払い方法は何が使えますか？",
      a: "クレジットカード（Visa / Mastercard / JCB / American Express）に対応予定です。",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-3xl font-extrabold sm:text-4xl">FAQ</h1>
      <p className="mb-12 text-sm text-muted-foreground">よくあるご質問</p>

      <div className="space-y-4">
        {faqs.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-border bg-card p-5 transition hover:border-primary/40"
          >
            <summary className="cursor-pointer text-sm font-bold text-foreground">
              <span className="mr-2 text-primary">Q.</span>
              {f.q}
            </summary>
            <p className="mt-3 pl-6 text-sm leading-7 text-muted-foreground">
              {f.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
}
