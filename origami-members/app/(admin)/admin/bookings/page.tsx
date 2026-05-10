import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "予約管理 | Admin" };

export default function AdminBookingsPage() {
  return (
    <ComingSoon
      phase="Phase 6 で実装"
      title="📅 予約管理"
      description="面談予約の一覧・キャンセル・返金処理は Phase 6 で実装予定です。"
      backHref="/admin"
      backLabel="管理ダッシュボードへ戻る"
    />
  );
}
