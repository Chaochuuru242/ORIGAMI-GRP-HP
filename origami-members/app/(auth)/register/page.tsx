import { RegisterForm } from "./register-form";

export const metadata = {
  title: "会員登録 | ORIGAMI GRP メンバーズ",
};

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
      <h1 className="mb-1 text-2xl font-extrabold">会員登録</h1>
      <p className="mb-8 text-xs text-muted-foreground">
        まずは無料会員からスタートできます
      </p>
      <RegisterForm />
    </div>
  );
}
