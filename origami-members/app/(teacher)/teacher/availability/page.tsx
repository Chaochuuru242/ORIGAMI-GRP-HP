import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata = { title: "空き時間管理 | ORIGAMI GRP" };

export default function AvailabilityPage() {
  return (
    <ComingSoon
      phase="Phase 6 で実装"
      title="📅 空き時間管理"
      description="カレンダー UI で空き時間枠を登録する機能は Phase 6 で実装予定です。"
      backHref="/teacher/dashboard"
      backLabel="講師ダッシュボードへ"
    />
  );
}
