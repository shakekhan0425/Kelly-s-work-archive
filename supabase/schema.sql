-- WORK / Archive · Supabase 表结构
-- 本文件由 `npm run migrate:supabase` 配合 .env 中的 SUPABASE 密钥执行。
-- 设计：每条集合存为 `data` jsonb 列（保留现有 ArchiveItem 结构，零字段映射成本）；
-- 详情页按 id 读取，列表/筛选在服务端内存完成（数据量 ≤ 数千，足够）。

create table if not exists signals (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
create table if not exists cases (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
create table if not exists podcasts (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
create table if not exists podcast_episodes (
  id text primary key,
  channel_id text,
  data jsonb not null,
  updated_at timestamptz default now()
);
create table if not exists english (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
create table if not exists sources (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
create table if not exists company_refs (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
create table if not exists company_registry (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
create table if not exists case_studies (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz default now()
);
create table if not exists meta (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- 索引：按 updated_at 排序取最新（可选）
create index if not exists signals_updated on signals (updated_at desc);
create index if not exists cases_updated on cases (updated_at desc);
create index if not exists epi_channel on podcast_episodes (channel_id);

-- 行级安全：公开站点，允许匿名 SELECT；写入仅服务端（service_role 绕过 RLS）
alter table signals enable row level security;
alter table cases enable row level security;
alter table podcasts enable row level security;
alter table podcast_episodes enable row level security;
alter table english enable row level security;
alter table sources enable row level security;
alter table company_refs enable row level security;
alter table company_registry enable row level security;
alter table case_studies enable row level security;
alter table meta enable row level security;

create policy "public read signals" on signals for select using (true);
create policy "public read cases" on cases for select using (true);
create policy "public read podcasts" on podcasts for select using (true);
create policy "public read podcast_episodes" on podcast_episodes for select using (true);
create policy "public read english" on english for select using (true);
create policy "public read sources" on sources for select using (true);
create policy "public read company_refs" on company_refs for select using (true);
create policy "public read company_registry" on company_registry for select using (true);
create policy "public read case_studies" on case_studies for select using (true);
create policy "public read meta" on meta for select using (true);

-- ─────────── 采集管线支撑表（服务端子流程使用，service_role 写入） ───────────

-- 去重日志：规范 URL/标题 hash 精确匹配 + 标题模糊匹配（pipeline/lib/dedupe.ts）
create table if not exists dedup_log (
  canonical_hash text primary key,
  article_id text,
  source_url text,
  title_norm text,
  method text,
  created_at timestamptz default now()
);
create index if not exists dedup_log_title on dedup_log (title_norm);

-- 采集运行记录：每次 ingest 的来源级运行审计（pipeline/lib/ingest.ts）
create table if not exists ingestion_runs (
  id uuid primary key,
  source_id text,
  status text,
  started_at timestamptz default now(),
  finished_at timestamptz,
  items_fetched int default 0,
  items_new int default 0,
  items_deduped int default 0,
  items_failed int default 0,
  error text
);
create index if not exists runs_source on ingestion_runs (source_id);
create index if not exists runs_started on ingestion_runs (started_at desc);
