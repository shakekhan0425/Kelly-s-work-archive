-- 用户自生成内容（笔记 / 收藏 / 观察名单 / 作品集）匿名云端桶。
-- Beta 阶段为单人共享桶：匿名（anon）可读写，无需登录。
-- 全量用户数据集中在单一 jsonb 行，结构见 src/lib/persistence.ts 的 UserStore。

create table if not exists public.user_data (
  id text primary key default 'kelly_global',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_data enable row level security;

drop policy if exists "anon read user_data" on public.user_data;
create policy "anon read user_data" on public.user_data
  for select using (true);

drop policy if exists "anon upsert user_data" on public.user_data;
create policy "anon upsert user_data" on public.user_data
  for insert with check (true);

drop policy if exists "anon update user_data" on public.user_data;
create policy "anon update user_data" on public.user_data
  for update using (true);
