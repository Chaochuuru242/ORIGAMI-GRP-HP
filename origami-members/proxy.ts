/**
 * Next.js 16 Proxy（旧 middleware）
 * 全リクエストでセッションを更新し、保護対象パスは未ログイン時に /login へリダイレクト
 */
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * 以下を除く全リクエストにマッチ：
     * - _next/static  (Next.js の静的ファイル)
     * - _next/image   (画像最適化)
     * - favicon.ico
     * - public 配下の静的アセット (.svg .png .jpg .jpeg .gif .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
