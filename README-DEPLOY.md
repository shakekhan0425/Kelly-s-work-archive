# WORK / Archive · 部署与动态架构说明

本工程已从「纯静态导出」升级为 **动态服务端渲染（SSR）+ Supabase + PWA**：

- 页面在**访问时**实时渲染，不再生成数千个静态 HTML 文件；
- 数据源 **Supabase 优先**，未配置时**回退本地 `data/archive.json`**，保证本地可构建可运行；
- 列表页（信号 / 案例）已分页，详情页按 `id` 运行时读取；
- 支持 **PWA**：可「添加到主屏幕」、离线访问已读页面。

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

---

## 4. 自动采集（运行时更新）— 已实现

采集管线 `pipeline/lib/ingest.ts` 在抓取 + AI 萃取后**直接 `upsert` 到 Supabase 的 `signals` / `cases` 表**（即网站读表），实现「抓到即更新」，不再写旧的 `articles` 表。

触发入口：`src/app/api/cron/ingest/route.ts`（Node runtime，`force-dynamic`）。

### 4.1 Vercel Cron（生产，推荐）
`vercel.json` 已配置（注意末尾斜杠，匹配 `trailingSlash: true` 的规范路径）：
```json
{ "crons": [ { "path": "/api/cron/ingest/", "schedule": "0 6 * * *" } ] }
```
部署后 Vercel 每日 06:00（UTC）自动调用，自带 `x-vercel-cron: 1` 头，路由直接放行。

### 4.2 手动 / 本地触发
```bash
# 带密钥（与 Vercel 环境变量 CRON_SECRET 一致）
curl "https://<你的域名>/api/cron/ingest?secret=<CRON_SECRET>"
# 或
curl -H "Authorization: Bearer <CRON_SECRET>" "https://<你的域名>/api/cron/ingest"
```
鉴权规则：未配 `CRON_SECRET` → 仅本地开发放行；带 `x-vercel-cron:1` → 放行；否则 `?secret=` 或 `Bearer` 必须与 `CRON_SECRET` 一致，否则返回 **401**。

### 4.3 采集源
遍历 `src/lib/data/sources.registry.ts` 中 `rss` 存在且 `accessMode==="open"` 的公开源；每源抽取 → 去重（`dedup_log`）→ AI 结构化 → 写 Supabase，运行审计记入 `ingestion_runs`。

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
