# WORK / Archive · 部署与动态架构说明

本工程已从「纯静态导出」升级为 **动态服务端渲染（SSR）+ Supabase + PWA**：

- 页面在**访问时**实时渲染，不再生成数千个静态 HTML 文件；
- 数据源 **Supabase 优先**，未配置时**回退本地 `data/archive.json`**，保证本地可构建可运行；
- 列表页（信号 / 案例）已分页，详情页按 `id` 运行时读取；
- 支持 **PWA**：可「添加到主屏幕」、离线访问已读页面。
- 同一份 GitHub 代码可同时部署到 **Vercel** 与 **Cloudflare Workers**，共用同一个 Supabase。

---

## 1. 本地开发

```bash
npm install
npm run dev          # 默认走 JSON 回退（无需 Supabase 即可开发）
```

访问 http://localhost:3000 。`liveSource()` 在未配置 Supabase 时返回 `"json"`，页面不显示「实时」徽标。

---

## 2. 连接 Supabase（实现自动更新）

### 2.1 建表
在 Supabase 后台的 SQL Editor 中执行 `supabase/schema.sql`（含 RLS：匿名公开只读）。

### 2.2 迁移本地数据
在项目根目录创建 `.env`（或导出环境变量）：

```bash
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # 仅迁移脚本使用，勿暴露给前端
```

```bash
npm run migrate:supabase
```

脚本会把 `archive.json`、公司注册表、播客单集、案例富化层写入 Supabase。

### 2.3 部署环境变量（Vercel）
在 Vercel 项目 → Settings → Environment Variables 添加：

| 变量 | 说明 | 必填 |
| --- | --- | --- |
| `SUPABASE_URL` | Supabase 项目 URL（服务端读取；也可用 `NEXT_PUBLIC_SUPABASE_URL`） | 实现「实时」时必填 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key（服务端读取 Supabase，受 RLS 限制为只读） | 实现「实时」时必填 |
| `SUPABASE_SERVICE_ROLE_KEY` | 仅 `migrate:supabase` 写入使用，勿在前端代码引用 | 迁移数据时必填 |
| `CRON_SECRET` | 采集定时任务 `/api/cron/ingest` 的鉴权密钥 | 生产环境必填 |

配置后，运行时 `liveSource()` 返回 `"supabase"`，页面显示「● 实时」徽标，内容随 Supabase 变化即时更新。

> **未配置以上变量也能正常部署**：网站自动回退到本地 `data/archive.json`，各列表页显示「● 本地档案」徽标，功能完整可用；建表 + 迁移 Supabase 后徽标变「● 实时」，内容随库自动更新（已修复：表缺失时不再伪造「实时」徽标、不再静默返回空数据）。

---

## 3. 部署到 Vercel

1. 推送代码到 GitHub / Git 仓库；
2. Vercel 导入仓库，Framework 选 **Next.js**（自动识别）；
3. Build Command：`next build`（默认）；Output：无需特殊设置；
4. 按 §2.3 配置环境变量；
5. Deploy。根目录即本工程目录（`work-archive-next`）。

> 注：本工程去掉了 `output: "export"`，因此**不再兼容仅托管静态文件的 Netlify Drop**。
> 若仍需静态托管，请保留 `next.config.ts` 中 `output: "export"`（但会失去运行时自动更新）。

### 3.1 部署到 Cloudflare Workers（OpenNext）

Cloudflare 使用官方 Next.js Workers 方案：`@opennextjs/cloudflare` + Wrangler，不使用 Pages 静态部署。

```bash
npm install
npm run preview   # 本地 Cloudflare Workers Runtime 预览
npm run deploy    # 发布到 workers.dev 或已配置的 Cloudflare Route
```

- Cloudflare 与 Vercel 继续读取同一个 Supabase，不创建第二个数据库；
- `NEXT_PUBLIC_SUPABASE_URL` 配置在 `wrangler.jsonc`，`NEXT_PUBLIC_SUPABASE_ANON_KEY` 作为 Worker Secret；
- `SUPABASE_SERVICE_ROLE_KEY` 只留在 GitHub Actions / Vercel 服务端，不上传到 Worker；
- `CF_WORKERS_BUILD=1` 只在 Cloudflare 构建时排除本地 JSON 回退，运行时以 Supabase 为主，避免超过 Workers 免费脚本体积限制；
- `workers.dev` 需要先在 Cloudflare 账号启用。账号若拒绝注册 `workers.dev` 子域，Worker 版本仍可上传，但不会生成公开生产 URL。

---

## 4. 自动采集（运行时更新）— 已实现

三个采集器都**直接 `upsert` 到 Supabase 的 `signals` / `cases` 表**（即网站读的表），配合全站 ISR（`src/app/layout.tsx` 的 `revalidate = 300`），采集写库后**最多 5 分钟自动上线，不需要重新构建**。

| 采集器 | 导出函数 | 目标 | 覆盖 |
| --- | --- | --- | --- |
| `pipeline/ingest-web.ts` | `runWebIngest()` | `signals` | 注册表里 `rss` 可用且 `accessMode==="open"` 的源 |
| `pipeline/ingest-sites.ts` | `runSitesIngest()` | `signals` | 无 RSS 的中文站列表页爬取（Morketing / 品牌星球 / TOPMarketing / 聚美丽 / 品观网） |
| `pipeline/ingest-cases.ts` | `runCasesIngest()` | `cases` | 案例站（数英 / SocialBeta / 广告门 / 品牌星球 / 聚美丽） |
| `pipeline/mark-live.ts` | `runMarkLive()` | `sources` | 把「库里确实有内容」的来源标记 `live:true` |

本地单独跑：`npm run ingest:web` / `ingest:sites` / `ingest:cases` / `mark:live`。

触发入口：`src/app/api/cron/ingest/route.ts`（Node runtime、`force-dynamic`、`maxDuration = 300`）。

### 4.1 当前定时采集方式

当前仓库的 `vercel.json` 没有启用 Vercel Cron（`crons: []`），`/api/cron/ingest` 仅保留兼容入口；正式采集由 `.github/workflows/ingest.yml` 每 6 小时执行，直接写入现有 Supabase。

因此 Cloudflare 不需要、也不会复制一套采集数据库。若以后重新启用 Vercel Cron，需要把该路由恢复为实际 Node 采集逻辑，并重新评估 Vercel/Workers 的运行时兼容性。

### 4.2 时间预算（Serverless 超时的关键）
全量采集本地约 **4~5 分钟**，会超过 Serverless 函数时长上限（Hobby 60s / Pro 300s）。
因此路由带**时间预算**：跑满就干净退出并在响应里如实上报 `truncated: true` 与剩余源数量；条目是逐条 upsert 的，中途停止**不会脏库**。

- 预算默认 `240000` ms，可用环境变量 **`CRON_BUDGET_MS`** 覆盖 —— **Hobby 套餐请设为 `45000`**。
- 未显式传 `offset` 时按「天」轮转分片起点，保证预算不足时不同日子从不同源开始，长期覆盖全部源。

### 4.3 手动 / 本地触发
```bash
# 全量
curl "https://<域名>/api/cron/ingest/?secret=<CRON_SECRET>"
# 只跑 RSS，限 10 个源，预算 60 秒
curl "https://<域名>/api/cron/ingest/?job=web&limit=10&budget=60000&secret=<CRON_SECRET>"
# 只刷新来源 live 标记
curl "https://<域名>/api/cron/ingest/?job=live&secret=<CRON_SECRET>"
```
参数：`job = all | web | sites | cases | live`，`budget`（毫秒）、`offset`、`limit`。
鉴权：未配 `CRON_SECRET` → 仅本地开发放行；带 `x-vercel-cron:1` → 放行；否则 `?secret=` 或 `Bearer` 必须匹配，不然 **401**。

### 4.4 被墙 / 无 RSS 的源怎么处理
- **`rsshub://<path>`**：注册表里可写伪协议，运行时展开为多个 RSSHub 镜像依次故障转移（`rsshub.rssforever.com` → `rsshub.ktachibana.party`）。36氪、虎嗅、华尔街见闻、第一财经、财新都走这条路。
- **`accessMode: "restricted"`**：feed 已下线 / 被 WAF 拦截 / 本环境不可达的源，标记后自动跳过，不再浪费采集时间；来源页显示「受限 · 暂不可采集」。
- feed 抓取一律走原生 `fetch` + `AbortController`（20s 强制中断）。**不要用 `rss-parser` 的 `parseURL`** —— 它的 `timeout` 对部分 WAF 主机不生效，会 TLS 握手挂死，拖垮整条流水线并产生假阴性。
- XML 入库前经 `sanitizeXml()` 清洗裸 `&`、未定义实体与非法控制字符（爱范儿等源必需），CDATA 段内不动，避免污染正文。

---

## 5. PWA 行为

- 图标：`public/icon.svg`（manifest 同时声明 `any` 与 `maskable`）；
- Service Worker：`public/sw.js`（安装期缓存应用壳 + 离线页 `/offline`；导航 network-first，静态资源 stale-while-revalidate）；
- 注册：仅生产环境自动注册（`src/components/archive/PwaRegister.tsx`）；
- 离线：已访问页面可离线翻阅，未访问页面回退到 `/offline`。

> 生产环境如需更高安装通过率，可补充 192×192 / 512×512 PNG 图标（当前用 SVG 已可在多数浏览器安装）。

---

## 6. 已知边界

- 部分 stub 页面（library / tools / studio / portfolio / interview / watchlists / visuals 等）仍读取本地 `archive.json`，未切到 Supabase；上线初期 Supabase 与 JSON 数据一致，不影响使用。
- 关联推荐（related）在 JSON 回退路径下基于本地数据计算；接 Supabase 后由 `live.ts` 统一读取。
- `data/archive.json` 仍随仓库部署（JSON 回退用），请勿删除。
