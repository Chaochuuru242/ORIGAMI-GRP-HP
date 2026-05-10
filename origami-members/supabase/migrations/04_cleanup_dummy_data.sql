-- =============================================================
-- 04_cleanup_dummy_data.sql
-- 動画・プレイリスト・お知らせ・カテゴリ・関連履歴を全削除
-- ⚠ profiles・admin_users・teachers・bookings・support_messages は残す
--
-- 実行後、サイトには動画・プレイリスト・お知らせ・カテゴリが0件の状態になります。
-- ユーザー・講師・予約・問合せはそのまま残ります。
--
-- 再実行時の注意：
--   - 03_seed.sql を再実行するとカテゴリが復活します
--   - カテゴリを使わない方針なら 03_seed.sql は再実行しないでください
-- =============================================================

BEGIN;

-- 1. プレイリスト関連（中間テーブル → 親）
DELETE FROM public.playlist_videos;
DELETE FROM public.playlists;

-- 2. 動画視聴／DL履歴
DELETE FROM public.video_views;
DELETE FROM public.video_downloads;

-- 3. videos.category_id を先に NULL にしてから、動画・カテゴリを削除
UPDATE public.videos SET category_id = NULL WHERE category_id IS NOT NULL;

-- 4. 動画本体
DELETE FROM public.videos;

-- 5. カテゴリ全削除（これでフィルタチップが空になる）
DELETE FROM public.categories;

-- 6. お知らせ全削除
DELETE FROM public.news;

-- ✓ 削除確認用 SELECT（削除した数を表示）
DO $$
DECLARE
  c_videos    integer;
  c_playlists integer;
  c_news      integer;
  c_cats      integer;
BEGIN
  SELECT count(*) INTO c_videos    FROM public.videos;
  SELECT count(*) INTO c_playlists FROM public.playlists;
  SELECT count(*) INTO c_news      FROM public.news;
  SELECT count(*) INTO c_cats      FROM public.categories;
  RAISE NOTICE '削除後の件数: videos=%, playlists=%, news=%, categories=%',
    c_videos, c_playlists, c_news, c_cats;
END $$;

COMMIT;
