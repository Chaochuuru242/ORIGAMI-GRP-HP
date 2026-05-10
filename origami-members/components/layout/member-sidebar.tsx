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
};

type Section = {
  /** セクション見出し（null なら見出し非表示） */
  title: string | null;
  /** このセクションを表示するロール条件 */
  visibleFor: "all" | "adder_admin" | "teacher_admin" | "admin";
  items: Item[];
};

const SECTIONS: Section[] = [
  {
    title: null, // 一般メニューは見出しなし
    visibleFor: "all",
    items: [
      { href: "/dashboard", label: "ダッシュボード", icon: "🏠" },
      { href: "/contents", label: "コンテンツ一覧", icon: "📚" },
      { href: "/playlists", label: "プレイリスト", icon: "📂" },
      { href: "/teachers", label: "講師を探す", icon: "🤝" },
      { href: "/bookings", label: "予約一覧", icon: "📅" },
    ],
  },
  {
    title: "アカウント",
    visibleFor: "all",
    items: [
      { href: "/account/billing", label: "お支払い・プラン", icon: "💳" },
      { href: "/profile", label: "プロフィール設定", icon: "👤" },
      { href: "/support", label: "サポート", icon: "💬" },
    ],
  },
  {
    title: "コンテンツ追加",
    visibleFor: "adder_admin",
    items: [{ href: "/upload", label: "動画の登録", icon: "🎥" }],
  },
  {
    title: "講師メニュー",
    visibleFor: "teacher_admin",
    items: [
      { href: "/teacher/dashboard", label: "講師ダッシュボード", icon: "🎓" },
    ],
  },
  {
    title: "運営管理",
    visibleFor: "admin",
    items: [{ href: "/admin", label: "管理画面", icon: "⚙️" }],
  },
];

function isSectionVisible(section: Section, role: Role): boolean {
  switch (section.visibleFor) {
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

const ROLE_LABEL: Record<Role, string> = {
  user: "一般会員",
  adder: "コンテンツ追加者",
  teacher: "講師",
  admin: "管理者",
};

export function MemberSidebar({ role }: { role: Role }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-background lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-border px-6 py-5">
          <Link
            href="/dashboard"
            className="block text-base font-extrabold text-primary"
          >
            ORIGAMI GRP
          </Link>
          <p className="text-xs text-muted-foreground">
            Member · <span className="font-bold">{ROLE_LABEL[role]}</span>
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {SECTIONS.filter((s) => isSectionVisible(s, role)).map(
            (section, sectionIdx) => (
              <div
                key={section.title ?? `section-${sectionIdx}`}
                className={cn("mb-4", sectionIdx === 0 ? "" : "pt-3")}
              >
                {section.title && (
                  <p className="mb-1 px-3 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                    {section.title}
                  </p>
                )}
                <ul className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/dashboard" &&
                        pathname.startsWith(item.href));
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
              </div>
            )
          )}
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
