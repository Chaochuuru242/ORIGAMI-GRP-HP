import { PasswordResetForm } from "./reset-form";

export const metadata = { title: "パスワード再設定 | ORIGAMI GRP メンバーズ" };

export default function PasswordResetPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-extrabold">パスワード再設定</h1>
      <p className="mb-8 text-xs text-muted-foreground">
        ご登録のメールアドレスに再設定リンクをお送りします
      </p>
      <PasswordResetForm />
    </div>
  );
}
