/**
 * Proxy（旧 middleware）から呼ばれる Supabase クライアント
 * セッションを更新し、必要ならリダイレクトレスポンスを返す
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // この呼び出しでセッションが自動更新される
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 保護対象パスのプレフィックス（Phase 進行に応じて拡張）
  const protectedPrefixes = [
    "/dashboard",
    "/contents",
    "/playlists",
    "/account",
    "/profile",
    "/support",
    "/bookings",
    "/upload",
    "/teacher",
    "/admin",
  ];
  const path = request.nextUrl.pathname;
  const isProtected = protectedPrefixes.some((p) => path.startsWith(p));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
