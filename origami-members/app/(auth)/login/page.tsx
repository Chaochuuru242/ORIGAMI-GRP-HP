import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "ログイン | ORIGAMI GRP メンバーズ",
};

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-extrabold">ログイン</h1>
      <p className="mb-8 text-xs text-muted-foreground">
        会員ページへログインします
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">読み込み中...</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
