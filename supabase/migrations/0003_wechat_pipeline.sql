-- ============================================================
-- 0003_wechat_pipeline.sql
-- WeChat 公众号自动接入管道（Wechat2RSS 私有云 → Supabase）
-- 架构：Wechat2RSS(Private Cloud) → Supabase Cron → Edge Function
--        → Supabase DB → WORK / Archive
-- ============================================================

-- 扩展（Supabase 默认已启用，IF NOT EXISTS 防止重复）
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ------------------------------------------------------------
-- 1) wechat_sources —— 订阅元数据 / 同步健康
-- ------------------------------------------------------------
create table if not exists public.wechat_sources (
  id                    text primary key,
  name                  text not null,
  wechat_biz_id         text,
  feed_url              text,
  status                text not null default 'auth_required'
                          check (status in (
                            'connected','syncing','healthy',
                            'rate_limited','auth_required','failed','paused','pending'
                          )),
  last_checked          timestamptz,
  last_successful_sync  timestamptz,
  latest_article_at     timestamptz,
  articles_imported     integer not null default 0,
  error_message         text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

create index if not exists idx_wechat_sources_status on public.wechat_sources(status);

-- ------------------------------------------------------------
-- 2) wechat_articles —— RAW → EXTRACTED → ANALYZED → VERIFIED → PUBLISHED
--    唯一键优先级：canonical_url（首选） / (source_id, external_id)
-- ------------------------------------------------------------
create table if not exists public.wechat_articles (
  id              uuid primary key default gen_random_uuid(),
  source_id       text references public.wechat_sources(id) on delete set null,
  external_id     text,                       -- 微信文章 token（/s/xxxx）
  canonical_url   text not null,              -- 规范化后的 mp.weixin.qq.com/s/xxxx
  title           text not null,
  author          text,
  published_at    timestamptz,
  original_url    text,
  content         text,
  hero_image      text,
  source_name     text,
  wechat_biz_id   text,
  status          text not null default 'raw'
                    check (status in ('raw','extracted','analyzed','verified','published')),
  ai              jsonb not null default '{}'::jsonb,   -- AI 萃取结果
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (source_id, external_id),
  unique (canonical_url)
);

create index if not exists idx_wechat_articles_status        on public.wechat_articles(status);
create index if not exists idx_wechat_articles_published_at  on public.wechat_articles(published_at desc);
create index if not exists idx_wechat_articles_source        on public.wechat_articles(source_id);

-- ------------------------------------------------------------
-- 3) sync_jobs —— 可观测性
-- ------------------------------------------------------------
create table if not exists public.sync_jobs (
  id              uuid primary key default gen_random_uuid(),
  source_id       text,
  job_type        text not null,
  started_at      timestamptz not null default now(),
  finished_at     timestamptz,
  status          text not null default 'running'
                    check (status in ('running','success','partial','failed')),
  items_found     integer not null default 0,
  items_inserted  integer not null default 0,
  items_updated   integer not null default 0,
  error_message   text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_sync_jobs_created on public.sync_jobs(created_at desc);

-- ------------------------------------------------------------
-- 4) processing_queue —— 视图（未发布 = 处理中）
-- ------------------------------------------------------------
create or replace view public.processing_queue as
  select id, source_id, title, status, published_at, created_at
  from public.wechat_articles
  where status <> 'published'
  order by created_at desc;

-- ------------------------------------------------------------
-- 5) wechat_health —— 匿名可读的聚合视图（不泄露正文内容）
-- ------------------------------------------------------------
create or replace view public.wechat_health as
  select
    (select count(*)               from public.wechat_sources)                                            as sources_total,
    (select count(*)               from public.wechat_sources where status = 'healthy')                   as sources_healthy,
    (select count(*)               from public.wechat_articles)                                           as articles_total,
    (select count(*)               from public.wechat_articles where status = 'published')                as articles_published,
    (select count(*)               from public.wechat_articles where status <> 'published')               as articles_processing,
    (select max(published_at)      from public.wechat_articles)                                           as latest_article_at;

-- ------------------------------------------------------------
-- 6) 触发器：updated_at 自动维护
-- ------------------------------------------------------------
create or replace function public.wechat_touch_updated() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_wechat_sources_updated on public.wechat_sources;
create trigger trg_wechat_sources_updated before update on public.wechat_sources
  for each row execute function public.wechat_touch_updated();

drop trigger if exists trg_wechat_articles_updated on public.wechat_articles;
create trigger trg_wechat_articles_updated before update on public.wechat_articles
  for each row execute function public.wechat_touch_updated();

-- ------------------------------------------------------------
-- 7) RLS
--    Edge Function 使用 service_role key（绕过 RLS）写入。
--    前端匿名（anon）只读取：来源健康、已发布文章、同步任务、聚合视图。
-- ------------------------------------------------------------
alter table public.wechat_sources   enable row level security;
alter table public.wechat_articles  enable row level security;
alter table public.sync_jobs        enable row level security;

drop policy if exists "anon read wechat_sources"   on public.wechat_sources;
create policy "anon read wechat_sources" on public.wechat_sources
  for select using (true);

drop policy if exists "anon read published wechat" on public.wechat_articles;
create policy "anon read published wechat" on public.wechat_articles
  for select using (status = 'published');

drop policy if exists "anon read sync_jobs" on public.sync_jobs;
create policy "anon read sync_jobs" on public.sync_jobs
  for select using (true);

drop policy if exists "anon read wechat_health" on public.wechat_health;
create policy "anon read wechat_health" on public.wechat_health
  for select using (true);

-- ------------------------------------------------------------
-- 8) Seed：目标公众号（营销 / 美妆 / 奢侈 高相关度）
--    状态初始为 auth_required：用户在 Wechat2RSS 后台扫码登录并
--    订阅后，Edge Function 会在同步时将其翻为 healthy / 自动发现。
--    wechat_biz_id 留空，由用户在后台订阅后填入或从 timeline 自动派生。
-- ------------------------------------------------------------
insert into public.wechat_sources (id, name, wechat_biz_id, status, notes) values
  ('wx-daofa',        '刀法研究所',        null, 'auth_required', '新消费品牌增长与操盘方法论'),
  ('wx-brandstar',    '品牌星球 BrandStar', null, 'auth_required', '新消费与 DTC 品牌成长案例'),
  ('wx-jumeili',      '聚美丽',            null, 'auth_required', '美妆营销与品牌增长深度内容'),
  ('wx-growthbox',    '增长黑盒 Growthbox', null, 'auth_required', '私域、用户增长与微信生态打法'),
  ('wx-qingyan',      '青眼',              null, 'auth_required', '美妆行业观察与数据'),
  ('wx-socialbeta',   'SocialBeta',        null, 'auth_required', '顶尖品牌营销案例与 campaign'),
  ('wx-morketing',    'Morketing',         null, 'auth_required', '营销与商业深度报道'),
  ('wx-digitaling',   '数英 DIGITALING',   null, 'auth_required', '数字营销作品与项目库'),
  ('wx-meihua',       '梅花网',            null, 'auth_required', '营销作品与广告案例'),
  ('wx-xinbang',      '新榜',              null, 'auth_required', '内容产业与新媒体榜单'),
  ('wx-latepost',     '晚点 LatePost',     null, 'auth_required', '商业与科技公司深度报道'),
  ('wx-cbo',          '化妆品财经在线',     null, 'auth_required', '美妆行业财经与渠道动态')
on conflict (id) do nothing;
