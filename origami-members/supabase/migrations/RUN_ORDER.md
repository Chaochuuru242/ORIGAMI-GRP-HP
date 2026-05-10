# Supabase Migration 実行手順

> 既存 Supabase プロジェクト（`gfvnnxuupdmbuxejyfck`）に対して、本アプリの完成形に必要なテーブル・カラム・RLSポリシーを追加します。
> **既存データを残したまま増設**します。

## ⚠ 実行前の必須確認

1. **本番DBであれば必ずバックアップを取る**
   - Supabase Dashboard → Database → Backups から最新バックアップを確認 / 作成
2. 実行は **業務時間外** を推奨（既存サイトが影響を受ける可能性）
3. 各 SQL は **トランザクション** で囲んでいる（失敗時はロールバック）

## 実行手順

### ① Supabase Dashboard を開く
https://supabase.com/dashboard/project/gfvnnxuupdmbuxejyfck

### ② SQL Editor を開く
左サイドバー → **SQL Editor** → **New query**

### ③ 順番に実行
以下のファイルを **1つずつ** コピペして「Run」を押してください。

| 順序 | ファイル | 内容 |
|---|---|---|
| 1 | `01_schema.sql` | テーブル新規作成・既存テーブル拡張（カラム追加） |
| 2 | `02_rls.sql` | RLSポリシー（既存挙動が変わる可能性あり・要確認） |
| 3 | `03_seed.sql` | 初期データ（カテゴリ6件、プラットフォーム設定） |

### ④ 実行後の確認

Dashboard → **Table Editor** で以下のテーブルが存在することを確認：
- categories
- playlists
- playlist_videos
- teachers
- teacher_availabilities
- bookings
- support_messages
- cancel_reasons
- platform_settings

profiles テーブルに以下のカラムが追加されていることを確認：
- stripe_customer_id, stripe_subscription_id, subscription_status,
  current_period_end, cancel_at_period_end, deleted_at, updated_at

videos テーブルに以下のカラムが追加されていることを確認：
- category_id, created_by, updated_at

### ⑤ Service Role Key を取得して .env.local に追加
Dashboard → **Project Settings** → **API** → **service_role secret** をコピーし、
`origami-members/.env.local` の `SUPABASE_SERVICE_ROLE_KEY=` に貼り付け。

## ロールバック方法

万が一問題が発生した場合：
1. **02_rls.sql** で追加されたポリシーは `DROP POLICY` で削除
2. **01_schema.sql** で追加された新規テーブルは `DROP TABLE` で削除
3. 既存テーブルへの `ADD COLUMN` は `ALTER TABLE ... DROP COLUMN` で削除可能

ロールバックSQLが必要な場合は別途生成しますのでお声掛けください。

## 注意事項

- `admin_users` テーブルは **削除しません**（互換性のため）。`profiles.role = 'admin'` への移行は完了しますが、admin_users テーブルはそのまま残ります。Phase 7 で削除予定。
- 既存テーブル（profiles, videos, video_views, video_downloads, news）の **既存RLSポリシーは削除しません**。新しいポリシーを追加するだけです。
