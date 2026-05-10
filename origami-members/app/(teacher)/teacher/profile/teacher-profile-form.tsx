"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateTeacherProfileAction,
  type TeacherProfileState,
} from "./actions";

export type TeacherProfileFormProps = {
  displayName: string;
  bio: string;
  photoUrl: string;
  specialties: string[];
  pricePerSession: number;
  isActive: boolean;
};

export function TeacherProfileForm(props: TeacherProfileFormProps) {
  const [state, formAction, isPending] = useActionState<
    TeacherProfileState,
    FormData
  >(updateTeacherProfileAction, {});

  return (
    <>
      {state.success && (
        <div className="mb-6 rounded-md border border-primary/40 bg-primary-light/40 p-4 text-sm">
          <strong className="font-bold text-primary">✓ 保存しました</strong>
          <p className="mt-1 text-xs text-muted-foreground">
            講師プロフィール情報を更新しました。{!props.isActive && " 公開には admin の承認が必要です。"}
          </p>
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="display_name">
            表示名 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="display_name"
            name="display_name"
            required
            defaultValue={props.displayName}
            placeholder="講師カードに表示される名前"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="photo_url">プロフィール写真 URL（任意）</Label>
          <Input
            id="photo_url"
            name="photo_url"
            type="url"
            defaultValue={props.photoUrl}
            placeholder="https://..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">自己紹介</Label>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            defaultValue={props.bio}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            placeholder="経歴・実績・対応領域などを記載"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialties">専門分野（カンマ区切り）</Label>
          <Input
            id="specialties"
            name="specialties"
            defaultValue={props.specialties.join(", ")}
            placeholder="ChatGPT活用, マーケティング, 業務効率化"
          />
          <p className="text-xs text-muted-foreground">
            「,」または「、」で区切って複数指定できます
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price_per_session">
            面談料金（60分・税込・円）<span className="text-destructive">*</span>
          </Label>
          <Input
            id="price_per_session"
            name="price_per_session"
            type="number"
            min={0}
            required
            defaultValue={props.pricePerSession}
          />
        </div>

        {state.error && (
          <p
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            role="alert"
          >
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? "保存中..." : "プロフィールを保存"}
        </Button>
      </form>
    </>
  );
}
