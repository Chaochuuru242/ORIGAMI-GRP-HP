"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction, type ProfileState } from "./actions";
import type { UserProfile } from "@/lib/auth/guards";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const searchParams = useSearchParams();
  const incomplete = searchParams.get("incomplete") === "1";

  const [state, formAction, isPending] = useActionState<ProfileState, FormData>(
    updateProfileAction,
    {}
  );

  return (
    <>
      {incomplete && (
        <div className="mb-6 rounded-md border border-primary/40 bg-primary-light/40 p-4 text-sm">
          <strong className="font-bold text-primary">
            プロフィール情報の設定が必要です
          </strong>
          <p className="mt-1 text-xs text-muted-foreground">
            フリガナ・英語表記を入力・保存してから、他の画面をご利用いただけます。
          </p>
        </div>
      )}

      {state.success && (
        <div className="mb-6 rounded-md border border-primary/40 bg-primary-light/40 p-4 text-sm">
          <strong className="font-bold text-primary">✓ 保存しました</strong>
          <p className="mt-1 text-xs text-muted-foreground">
            プロフィール情報を更新しました。
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="full_name">
            お名前 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name === "未設定" ? "" : profile.full_name ?? ""}
            required
            placeholder="山田 太郎"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name_kana">
            フリガナ <span className="text-destructive">*</span>
          </Label>
          <Input
            id="full_name_kana"
            name="full_name_kana"
            defaultValue={
              profile.full_name_kana === "未設定" ? "" : profile.full_name_kana ?? ""
            }
            required
            placeholder="ヤマダ タロウ"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="full_name_english">
            英語表記 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="full_name_english"
            name="full_name_english"
            defaultValue={
              profile.full_name_english === "未設定"
                ? ""
                : profile.full_name_english ?? ""
            }
            required
            placeholder="TARO YAMADA"
            pattern="^\S+[\s　]+.+$"
            title="ファーストネームとラストネームの間にスペースを入れてください"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス（変更不可）</Label>
          <Input
            id="email"
            value={profile.email}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            メールアドレスの変更はサポートにご相談ください
          </p>
        </div>

        {state.error && (
          <p
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            role="alert"
          >
            {state.error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "保存中..." : "プロフィールを保存"}
        </Button>
      </form>
    </>
  );
}
