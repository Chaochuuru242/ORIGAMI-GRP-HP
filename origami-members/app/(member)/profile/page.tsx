import { Suspense } from "react";
import { requireUser } from "@/lib/auth/guards";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "プロフィール設定 | ORIGAMI GRP メンバーズ" };

export default async function ProfilePage() {
  const { profile } = await requireUser();

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-extrabold">プロフィール設定</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          氏名・フリガナ・英語表記をご登録ください
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-8">
        <Suspense
          fallback={<p className="text-sm text-muted-foreground">読み込み中...</p>}
        >
          <ProfileForm profile={profile} />
        </Suspense>
      </div>
    </div>
  );
}
