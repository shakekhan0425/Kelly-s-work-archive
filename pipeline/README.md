# WORK / Archive — 后端采集流水线（Supabase + AI 萃取）

> 本目录是 **可部署但当前未运行** 的后端代码。它解决归档 MD §2.4 的「后端采集」需求：
> `Source → RSS/Web/Newsletter → 抽取 → 去重 → AI 结构化分析 → DB → Workbench`。
>
> **铁律**：流水线只存储「真实抓取 + AI 萃取」的结果，**绝不伪造任何内容**（标题/正文/单集/知识点均不得编造）。
> 所有失败来源会被跳过并记录到 `ingestion_runs`，绝不退化为占位数据。

---

## 1. 前置条件

- 一个 Supabase 项目（免费层即可），获得：
  - `SUPABASE_URL`（项目 URL）
  - `SUPABASE_SERVICE_ROLE_KEY`（服务端密钥，绕过 RLS，仅后端使用）
  - （可选）`NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 供前端读库
- 一个兼容 OpenAI 的 LLM 端点（用于结构化萃取）：
  - `LLM_BASE_URL`（如 `https://api.openai.com/v1`）
  - `LLM_API_KEY`
  - `LLM_MODEL`（如 `gpt-4o-mini`）
- Node 20+，`tsx`（`npm i -D tsx`，已在 devDependencies）

复制 `.env.example` 为 `.env.local` 并填值。

## 2. 部署步骤

```bash
# 0. 安装依赖（含 tsx）
npm install

# 1. 建表：在 Supabase SQL Editor 执行 supabase/schema.sql
#    （或本地 supabase-cli: supabase db push）

# 2. 灌入真实静态数据（来源/公司/播客频道；来自 src/lib/data/*.registry.ts）
npm run pipeline:seed

# 3. 开始采集：拉取 RSS/Web → 抽取 → 去重 → AI 分析 → 入库
npm run pipeline:ingest          # 全量
npm run pipeline:ingest -- --source brandstar   # 单源

# 4. 公众号剪藏（粘贴链接 / 正文 / 手机分享）
npm run pipeline -- import-wechat --url <mp_url>
npm run pipeline -- import-wechat --file clip.json   # {title,author,url,html,blocks}

# 5. Newsletter 邮箱导入（专用邮箱 Export 后提交 JSON）
npm run pipeline -- import-newsletter --file nl.json

# 6. 定时采集（本地常驻 / 容器 / Trigger.dev / Vercel Cron）
npm run pipeline:cron            # 默认每 30 分钟一轮，按来源频率
```

## 3. 数据流与模块

| 模块 | 职责 |
|---|---|
| `lib/supabase.ts` | 后端 admin 客户端（`service_role`），写库 |
| `lib/llm.ts` | 调用 LLM，返回结构化 JSON（带容错抽取） |
| `lib/extract.ts` | 网页正文抽取（`@extractus/article-extractor`），保留图片/标题 |
| `lib/dedupe.ts` | 基于标题归一化 + 内容哈希的去重，记录 `dedup_log` |
| `lib/analyze.ts` | 把真实正文 → 结构化 knowledge card（背景/事实/观点/影响/启示/英语/面试） |
| `lib/ingest.ts` | 编排：解析 RSS/Atom → 逐篇 fetch→extract→dedupe→analyze→upsert |
| `lib/import-wechat.ts` | 公众号三种入库方式 |
| `lib/import-newsletter.ts` | Newsletter 邮箱导入 |
| `lib/scheduler.ts` | 定时轮询（可替换为 pg_cron / Trigger.dev） |
| `seed.ts` | 把 `*.registry.ts` 的真实来源/公司/播客写入 DB |
| `fetch-podcasts.ts` | 构建期拉取真实 RSS 单集 → `podcasts.episodes.json` |
| `cli.ts` | 命令入口 |

## 4. 与前端原型的关系

- 现状：前端用 `data/archive.json` + `src/lib/data/*.registry.ts`（静态，已含真实数据）。
- 切换：当 Supabase 就绪后，把前端读取层从 `archive.ts` 改为查询 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 的 `articles/sources/companies/podcasts` 视图即可；字段已对齐（`block` 结构与前端 `Block` 一致）。

## 5. 安全

- `service_role` key 只在服务端/流水线使用，**绝不**暴露给浏览器。
- RLS 已开启：匿名可读，写入仅 `service_role`。
- 公众号/Newsletter 导入内容同样经过抽取+去重+AI 分析，不直存未处理文本以外的额外字段。
