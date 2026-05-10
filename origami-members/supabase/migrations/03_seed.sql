-- =============================================================
-- 03_seed.sql
-- ORIGAMI GRP メンバーズ 初期データ
-- 既存データに影響を与えないよう ON CONFLICT DO NOTHING を活用
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- カテゴリ初期データ（既存 contents.html のフィルタ項目を踏襲）
-- -------------------------------------------------------------
INSERT INTO public.categories (name, slug, sort_order) VALUES
  ('AI・ChatGPT',     'ai-chatgpt',     10),
  ('効率化ツール',     'efficiency',     20),
  ('活用・実務',       'practical',      30),
  ('マーケティング',   'marketing',      40),
  ('デザイン・画像',   'design',         50),
  ('未分類',           'uncategorized',  999)
ON CONFLICT (slug) DO NOTHING;

-- -------------------------------------------------------------
-- 既存 videos の category_id を「未分類」に
-- -------------------------------------------------------------
UPDATE public.videos
SET category_id = (SELECT id FROM public.categories WHERE slug = 'uncategorized')
WHERE category_id IS NULL;

-- -------------------------------------------------------------
-- platform_settings 初期値
-- -------------------------------------------------------------
INSERT INTO public.platform_settings (key, value) VALUES
  -- プラットフォーム手数料率（デフォルト 20%、講師個別の値が NULL の場合に使用）
  ('platform_fee_rate_default',       '0.20'::jsonb),
  -- 面談1コマの所要時間（分）
  ('booking_duration_minutes',        '60'::jsonb),
  -- キャンセル可能期限（時間）
  ('cancel_deadline_hours',           '24'::jsonb),
  -- 予約リマインドメール送信タイミング（時間前のリスト）
  ('booking_reminder_hours_before',   '[24, 1]'::jsonb),
  -- 視聴記録のしきい値（秒）
  ('video_view_threshold_seconds',    '180'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMIT;
