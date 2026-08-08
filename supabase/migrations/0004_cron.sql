-- ============================================================
-- 0004_cron.sql
-- 用 Supabase Cron（pg_cron + pg_net）调度微信管道，
-- 取代已失效的 Vercel Cron（vercel.json 中的 crons 已移除）。
--
-- 重要：
--   1) 本文件必须在 Edge Function 部署完成后执行（函数 URL 才有效）。
--   2) 函数设为 public（verifyJWT=false），靠 x-cron-secret 头鉴权，
--      因此 pg_net 调用无需签发 JWT。
--   3) CRON_SECRET 与 .env.local 中的 CRON_SECRET 保持一致。
--   4) 微信同步频率（每 8 分钟）只负责 Wechat2RSS → Archive 的同步，
--      不会高频强刷微信接口，避免触发风控。
-- ============================================================

-- 项目 ref（已知）
-- xecllrzcdalpxbxekunm
-- 函数地址：
--   https://xecllrzcdalpxbxekunm.supabase.co/functions/v1/ingest-wechat
--   https://xecllrzcdalpxbxekunm.supabase.co/functions/v1/process-wechat

-- 删除旧任务（幂等）
select cron.unschedule('ingest-wechat');
select cron.unschedule('process-wechat');

-- ① 采集：Wechat2RSS → wechat_articles（每 8 分钟）
-- ⚠️ 把下面两处 <CRON_SECRET> 替换为你 Supabase Secrets 里设置的 CRON_SECRET 值（自行生成强随机值，不要用已泄露的）。
select cron.schedule(
  'ingest-wechat',
  '*/8 * * * *',
  $$
  select net.http_post(
    url := 'https://xecllrzcdalpxbxekunm.supabase.co/functions/v1/ingest-wechat',
    headers := '{"x-cron-secret":"<CRON_SECRET>"}'::jsonb,
    timeout_milliseconds := 20000
  );
  $$
);

-- ② 处理：RAW → PUBLISHED + 写入 signals（每 15 分钟）
select cron.schedule(
  'process-wechat',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://xecllrzcdalpxbxekunm.supabase.co/functions/v1/process-wechat',
    headers := '{"x-cron-secret":"<CRON_SECRET>"}'::jsonb,
    timeout_milliseconds := 30000
  );
  $$
);

-- 查看已注册任务
-- select * from cron.job;
