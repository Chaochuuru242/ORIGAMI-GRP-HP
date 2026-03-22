-- profiles テーブルの作成
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  role text not null default 'member',
  plan_type text not null default 'free',
  payment_status text not null default 'unpaid',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS (Row Level Security) の有効化
alter table public.profiles enable row level security;

-- 自分のプロフィールのみ参照可能
create policy "Users can view own profile"
  on public.profiles for select
  using ( auth.uid() = id );

-- 自分のプロフィールのみ更新可能 (role, plan_type 等は管理者のみ更新可能にするのが理想)
-- ここでは簡易化のため全項目更新を許可していますが、実運用では項目を制限してください
create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

-- 新規ユーザー作成時に自動で profiles レコードを作成するトリガー (推奨)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
