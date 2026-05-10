"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(member)/logout-action";

const items = [
  { href: "/admin", label: "管理ダッシュボード", icon: "🏠" },
  { href: "/admin/users", label: "ユーザー管理", icon: "👥" },
  { href: "/admin/videos", label: "動画管理", icon: "🎬" },
  { href: "/admin/videos/pending", label: "動画承認", icon: "✅", badge: "pending" },
  { href: "/admin/categories", label: "カテゴリ", icon: "🗂" },
  { href: "/admin/playlists", label: "プレイリスト", icon: "📂" },
  { href: "/admin/news", label: "お知らせ", icon: "📰" },
  { href: "/admin/teachers", label: "講師管理", icon: "🎓" },
  { href: "/admin/bookings", label: "予約管理", icon: "📅" },
  { href: "/admin/analytics", label: "分析", icon: "📈" },
];

export function AdminSidebar({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-border px-6 py-5">
          <Link href="/admin" className="block text-base font-extrabold text-primary">
            ORIGAMI GRP
          </Link>
          <p className="text-xs font-bold text-muted-foreground">Admin Console</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm transition",
                      isActive
                        ? "bg-primary-light/40 font-bold text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    {item.badge === "pending" && pendingCount > 0 && (
                      <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {pendingCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 border-t border-border pt-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              ← メンバーサイトへ戻る
            </Link>
          </div>
        </nav>

        <div className="border-t border-border px-6 py-4">
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
