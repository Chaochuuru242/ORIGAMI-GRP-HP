/* 
  supabase-config.js
  Supabase 接続設定
*/

// TODO: 実際のプロジェクトの URL と Anon Key に差し替えてください
const SUPABASE_URL = 'https://your-project-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

// SDK の初期化
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 注意: service_role key はセキュリティ上、フロントエンドには絶対に配置しないでください。
