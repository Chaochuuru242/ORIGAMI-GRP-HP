-- =============================================================
-- 01_schema.sql
-- ORIGAMI GRP メンバーズ 完成形スキーマ（テーブル・カラム・インデックス）
-- 既存DBに対する増設。既存データは保持される。
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- profiles テーブル（必須・あれば ALTER、なければ CREATE）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user',
  plan text NOT NULL DEFAULT 'free',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name_kana text,
  ADD COLUMN IF NOT EXISTS full_name_english text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS subscription_status text,
  ADD COLUMN IF NOT EXISTS current_period_end timestamptz,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- stripe_customer_id にユニーク制約（既に存在する場合は無視）
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_stripe_customer_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_stripe_customer_id_key UNIQUE (stripe_customer_id);
  END IF;
END $$;

-- updated_at の自動更新トリガー
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_set_updated_at ON public.profiles;
CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------
-- categories（動画カテゴリ）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- videos テーブル（あれば ALTER、なければ CREATE）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  target_plan text NOT NULL DEFAULT 'all',
  status text NOT NULL DEFAULT 'pending',
  content_details text,
  learning_materials text,
  practice_checks text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.videos
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories(id),
  ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS videos_set_updated_at ON public.videos;
CREATE TRIGGER videos_set_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------
-- playlists（学習プレイリスト）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text,
  target_plan text NOT NULL DEFAULT 'all',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.playlist_videos (
  playlist_id uuid REFERENCES public.playlists(id) ON DELETE CASCADE,
  video_id uuid REFERENCES public.videos(id) ON DELETE CASCADE,
  position integer NOT NULL,
  PRIMARY KEY (playlist_id, video_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_videos_position
  ON public.playlist_videos (playlist_id, position);

-- -------------------------------------------------------------
-- teachers（講師）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  photo_url text,
  bio text,
  specialties text[] NOT NULL DEFAULT '{}',
  price_per_session integer NOT NULL,
  stripe_account_id text UNIQUE,
  stripe_onboarding_completed boolean NOT NULL DEFAULT false,
  platform_fee_rate numeric(5,2),
  is_active boolean NOT NULL DEFAULT true,
  invited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teachers_is_active ON public.teachers (is_active);

-- -------------------------------------------------------------
-- teacher_availabilities（講師空き時間）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_availabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  is_booked boolean NOT NULL DEFAULT false,
  UNIQUE (teacher_id, start_at)
);

CREATE INDEX IF NOT EXISTS idx_teacher_availabilities_teacher_start
  ON public.teacher_availabilities (teacher_id, start_at);

-- -------------------------------------------------------------
-- bookings（面談予約）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id),
  availability_id uuid REFERENCES public.teacher_availabilities(id),
  start_at timestamptz NOT NULL,
  end_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'confirmed', 'canceled', 'completed', 'rescheduling')),
  price integer NOT NULL,
  platform_fee integer NOT NULL,
  teacher_payout integer NOT NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_transfer_id text,
  google_meet_url text,
  google_calendar_event_id text,
  canceled_at timestamptz,
  canceled_by uuid REFERENCES public.profiles(id),
  cancel_reason text,
  refunded_at timestamptz,
  stripe_refund_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ダブルブッキング防止: confirmed のみユニーク
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_no_double_booking
  ON public.bookings (teacher_id, start_at)
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_teacher ON public.bookings (teacher_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings (status);

-- -------------------------------------------------------------
-- support_messages（サポート問い合わせ）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- cancel_reasons（解約理由アンケート）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cancel_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id),
  reason text NOT NULL CHECK (reason IN ('price', 'unused', 'content_mismatch', 'temporary', 'other')),
  free_text text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------
-- platform_settings（運営設定 KVS）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS platform_settings_set_updated_at ON public.platform_settings;
CREATE TRIGGER platform_settings_set_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -------------------------------------------------------------
-- news テーブル（あれば ALTER、なければ CREATE）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.news
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- 既存newsに body/published_at を埋める（NULLの場合のみ）
UPDATE public.news SET body = title WHERE body IS NULL;
UPDATE public.news SET published_at = created_at WHERE published_at IS NULL;

-- -------------------------------------------------------------
-- video_views（既存・なければ作成）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.video_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_views_user ON public.video_views (user_id);
CREATE INDEX IF NOT EXISTS idx_video_views_video ON public.video_views (video_id);

-- -------------------------------------------------------------
-- video_downloads（既存・なければ作成）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.video_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES public.videos(id) ON DELETE CASCADE,
  material_type text NOT NULL CHECK (material_type IN ('learning_materials', 'practice_checks')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_downloads_user ON public.video_downloads (user_id);

-- -------------------------------------------------------------
-- admin_users（既存・なければ作成。Phase 7で削除予定）
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- -------------------------------------------------------------
-- admin_users → profiles.role='admin' に統合（admin_users テーブルは残す）
-- -------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_users') THEN
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id IN (SELECT id FROM public.admin_users)
      AND role <> 'admin';
  END IF;
END $$;

COMMIT;
