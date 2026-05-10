import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "講師管理 | Admin" };

export default function AdminTeachersPage() {
  return (
    <ComingSoon
      phase="Phase 5 で実装"
      title="🎓 講師管理"
      description="講師の招待リンク発行・有効化／無効化・手数料率設定は Phase 5 で実装予定です。"
      backHref="/admin"
      backLabel="管理ダッシュボードへ戻る"
    />
  );
}
