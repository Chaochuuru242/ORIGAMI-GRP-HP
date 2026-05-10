import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-[1140px] items-center justify-between px-6">
          <Link href="/" className="flex items-baseline gap-2 font-extrabold">
            <span className="text-lg text-primary">ORIGAMI GRP</span>
            <span className="text-xs font-normal text-muted-foreground">
              Member
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-primary"
          >
            ← トップへ戻る
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        {children}
      </main>
    </div>
  );
}
