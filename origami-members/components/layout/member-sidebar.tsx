"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/plan/constants";
import { logoutAction } from "@/app/(member)/logout-action";

type Item = {
  href: string;
  label: string;
  icon: string;
  visibleFor: "all" | "adder_admin" | "teacher_admin" | "admin";
};

const items: Item[] = [
  { href: "/dashboard", label: "ダッシュボード", icon: "🏠", visibleFor: "all" },
  { href: "/contents", label: "コンテンツ一覧", icon: "📚", visibleFor: "all" },
  { href: "/playlists", label: "プレイリスト", icon: "📂", visibleFor: "all" },
  { href: "/teachers", label: "講師を探す", icon: "🤝", visibleFor: "all" },
  { href: "/bookings", label: "予約一覧", icon: "📅", visibleFor: "all" },
  { href: "/account/billing", label: "お支払い・プラン", icon: "💳", visibleFor: "all" },
  { href: "/support", label: "サポート", icon: "💬", visibleFor: "all" },
  { href: "/profile", label: "プロフィール設定", icon: "👤", visibleFor: "all" },
  { href: "/upload", label: "動画の登録", icon: "🎥", visibleFor: "adder_admin" },
  { href: "/teacher/dashboard", label: "講師メニュー", icon: "🎓", visibleFor: "teacher_admin" },
  { href: "/admin", label: "管理画面", icon: "⚙️", visibleFor: "admin" },
];

function isVisible(item: Item, role: Role): boolean {
  switch (item.visibleFor) {
    case "all":
      return true;
    case "adder_admin":
      return role === "adder" || role === "admin";
    case "teacher_admin":
      return role === "teacher" || role === "admin";
    case "admin":
      return role === "admin";
  }
}

export function MemberSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-border px-6 py-5">
          <Link href="/dashboard" className="block text-base font-extrabold text-primary">
            ORIGAMI GRP
          </Link>
          <p className="text-xs text-muted-foreground">Member</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {items
              .filter((item) => isVisible(item, role))
              .map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                        isActive
                          ? "bg-primary-light/40 font-bold text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
          </ul>
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
