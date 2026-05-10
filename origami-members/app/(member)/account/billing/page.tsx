import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "お支払い・プラン | ORIGAMI GRP メンバーズ" };

export default function BillingPage() {
  return (
    <ComingSoon
      phase="Phase 4 で実装"
      title="💳 お支払い・プラン管理"
      description={
        "Stripe 決済機能を Phase 4 で実装予定です。\n現状は管理画面でロール／プランの手動変更で対応しています。"
      }
    />
  );
}
