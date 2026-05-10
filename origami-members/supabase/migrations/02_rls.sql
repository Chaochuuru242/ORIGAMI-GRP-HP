-- =============================================================
-- 02_rls.sql
-- ORIGAMI GRP メンバーズ RLSポリシー
-- ⚠ 既存テーブルへも適用するため、既存挙動が変わる可能性あり
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- ヘルパー関数：現在のユーザーが admin か
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ヘルパー関数：現在のユーザーが adder または admin か
CREATE OR REPLACE FUNCTION public.is_adder_or_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('adder', 'admin')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ヘルパー関数：現在のユーザーが teacher か
CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'teacher'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ヘルパー関数：現在のユーザーのプラン
CREATE OR REPLACE FUNCTION public.current_user_plan()
RETURNS text AS $$
  SELECT plan FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================================
-- profiles
-- =============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_select_self_or_admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_self_or_admin" ON public.profiles;
CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================================
-- categories
-- =============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_all" ON public.categories;
CREATE POLICY "categories_select_all" ON public.categories
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "categories_admin_all" ON public.categories;
CREATE POLICY "categories_admin_all" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================
-- videos
-- =============================================================
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "videos_select_published_all" ON public.videos;
CREATE POLICY "videos_select_published_all" ON public.videos
  FOR SELECT TO anon, authenticated
  USING (status = 'published' OR public.is_adder_or_admin());

DROP POLICY IF EXISTS "videos_insert_adder_admin" ON public.videos;
CREATE POLICY "videos_insert_adder_admin" ON public.videos
  FOR INSERT TO authenticated
  WITH CHECK (public.is_adder_or_admin());

DROP POLICY IF EXISTS "videos_update_adder_admin" ON public.videos;
CREATE POLICY "videos_update_adder_admin" ON public.videos
  FOR UPDATE TO authenticated
  USING (public.is_adder_or_admin());

DROP POLICY IF EXISTS "videos_delete_admin" ON public.videos;
CREATE POLICY "videos_delete_admin" ON public.videos
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================================
-- playlists
-- =============================================================
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "playlists_select_all" ON public.playlists;
CREATE POLICY "playlists_select_all" ON public.playlists
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "playlists_admin_all" ON public.playlists;
CREATE POLICY "playlists_admin_all" ON public.playlists
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================
-- playlist_videos
-- =============================================================
ALTER TABLE public.playlist_videos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "playlist_videos_select_all" ON public.playlist_videos;
CREATE POLICY "playlist_videos_select_all" ON public.playlist_videos
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "playlist_videos_admin_all" ON public.playlist_videos;
CREATE POLICY "playlist_videos_admin_all" ON public.playlist_videos
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================
-- teachers
-- =============================================================
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teachers_select_active_or_admin" ON public.teachers;
CREATE POLICY "teachers_select_active_or_admin" ON public.teachers
  FOR SELECT TO anon, authenticated
  USING (is_active = true OR public.is_admin() OR auth.uid() = id);

DROP POLICY IF EXISTS "teachers_insert_admin" ON public.teachers;
CREATE POLICY "teachers_insert_admin" ON public.teachers
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "teachers_update_self_or_admin" ON public.teachers;
CREATE POLICY "teachers_update_self_or_admin" ON public.teachers
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "teachers_delete_admin" ON public.teachers;
CREATE POLICY "teachers_delete_admin" ON public.teachers
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================================
-- teacher_availabilities
-- =============================================================
ALTER TABLE public.teacher_availabilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "availabilities_select_all" ON public.teacher_availabilities;
CREATE POLICY "availabilities_select_all" ON public.teacher_availabilities
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "availabilities_modify_self_or_admin" ON public.teacher_availabilities;
CREATE POLICY "availabilities_modify_self_or_admin" ON public.teacher_availabilities
  FOR ALL TO authenticated
  USING (teacher_id = auth.uid() OR public.is_admin())
  WITH CHECK (teacher_id = auth.uid() OR public.is_admin());

-- =============================================================
-- bookings
-- =============================================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookings_select_participant_or_admin" ON public.bookings;
CREATE POLICY "bookings_select_participant_or_admin" ON public.bookings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR teacher_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "bookings_insert_authenticated" ON public.bookings;
CREATE POLICY "bookings_insert_authenticated" ON public.bookings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "bookings_update_admin_or_teacher" ON public.bookings;
CREATE POLICY "bookings_update_admin_or_teacher" ON public.bookings
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR teacher_id = auth.uid() OR user_id = auth.uid());

DROP POLICY IF EXISTS "bookings_delete_admin" ON public.bookings;
CREATE POLICY "bookings_delete_admin" ON public.bookings
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================================
-- video_views
-- =============================================================
ALTER TABLE public.video_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "video_views_select_self_or_admin" ON public.video_views;
CREATE POLICY "video_views_select_self_or_admin" ON public.video_views
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "video_views_insert_self" ON public.video_views;
CREATE POLICY "video_views_insert_self" ON public.video_views
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "video_views_delete_admin" ON public.video_views;
CREATE POLICY "video_views_delete_admin" ON public.video_views
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================================
-- video_downloads
-- =============================================================
ALTER TABLE public.video_downloads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "video_downloads_select_self_or_admin" ON public.video_downloads;
CREATE POLICY "video_downloads_select_self_or_admin" ON public.video_downloads
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "video_downloads_insert_self" ON public.video_downloads;
CREATE POLICY "video_downloads_insert_self" ON public.video_downloads
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "video_downloads_delete_admin" ON public.video_downloads;
CREATE POLICY "video_downloads_delete_admin" ON public.video_downloads
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================================
-- news
-- =============================================================
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "news_select_all" ON public.news;
CREATE POLICY "news_select_all" ON public.news
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "news_admin_all" ON public.news;
CREATE POLICY "news_admin_all" ON public.news
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- =============================================================
-- support_messages
-- =============================================================
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_messages_select_self_or_admin" ON public.support_messages;
CREATE POLICY "support_messages_select_self_or_admin" ON public.support_messages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "support_messages_insert_self" ON public.support_messages;
CREATE POLICY "support_messages_insert_self" ON public.support_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "support_messages_delete_admin" ON public.support_messages;
CREATE POLICY "support_messages_delete_admin" ON public.support_messages
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- =============================================================
-- cancel_reasons
-- =============================================================
ALTER TABLE public.cancel_reasons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cancel_reasons_select_admin" ON public.cancel_reasons;
CREATE POLICY "cancel_reasons_select_admin" ON public.cancel_reasons
  FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "cancel_reasons_insert_self" ON public.cancel_reasons;
CREATE POLICY "cancel_reasons_insert_self" ON public.cancel_reasons
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- =============================================================
-- platform_settings
-- =============================================================
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_settings_admin_all" ON public.platform_settings;
CREATE POLICY "platform_settings_admin_all" ON public.platform_settings
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 全認証済ユーザーが READ できる設定キーは別途専用ビューを作るのが望ましいが
-- 当面 admin のみ参照可とする。クライアント側でこの値を必要とする場合は
-- API ルートを介して取得する方針

COMMIT;
