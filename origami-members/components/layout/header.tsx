/**
 * 公開ページ用ヘッダー（未ログイン者向け）
 * メンバーページではこれは使わず member-sidebar.tsx を使う
 */
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-6">
        <Link href="/" className="flex items-baseline gap-2 font-extrabold">
          <span className="text-lg text-primary">ORIGAMI GRP</span>
          <span className="text-xs font-normal text-muted-foreground">
            Member
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link
            href="/pricing"
            className="text-muted-foreground transition hover:text-primary"
          >
            プラン一覧
          </Link>
          <Link
            href="/teachers"
            className="text-muted-foreground transition hover:text-primary"
          >
            講師を探す
          </Link>
          <Link
            href="/faq"
            className="text-muted-foreground transition hover:text-primary"
          >
            FAQ
          </Link>
          <Button render={<Link href="/login" />} variant="ghost" size="sm">
            ログイン
          </Button>
          <Button render={<Link href="/register" />} size="sm">
            会員登録
          </Button>
        </nav>

        {/* モバイル：簡易メニュー（後で hamburger 化予定） */}
        <div className="flex items-center gap-2 md:hidden">
          <Button render={<Link href="/login" />} variant="ghost" size="sm">
            ログイン
          </Button>
          <Button render={<Link href="/register" />} size="sm">
            登録
          </Button>
        </div>
      </div>
    </header>
  );
}
