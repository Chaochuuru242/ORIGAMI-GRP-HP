import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-muted/30">
      <div className="mx-auto max-w-[1140px] px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="text-base font-extrabold text-primary">
              ORIGAMI GRP
            </Link>
            <p className="mt-3 text-xs leading-6 text-muted-foreground">
              AI を「稼ぐ力」に変える、会員制伴走支援ポータル。
              <br />
              実践プロンプト、活用テンプレート、講師による面談サポート。
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold tracking-wider text-foreground uppercase">
              Member
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-primary">
                  会員ホーム
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="hover:text-primary">
                  講師を探す
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold tracking-wider text-foreground uppercase">
              Support
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link href="/faq" className="hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary">
                  ログイン
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary">
                  会員登録
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-border pt-6 text-xs text-muted-foreground">
          <span>&copy; 2026 ORIGAMI GRP. Member System.</span>
        </div>
      </div>
    </footer>
  );
}
