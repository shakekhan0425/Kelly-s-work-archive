# CODEX.md — WORK / Archive 工程交接指南（给下一个 Agent）

> 本文件是仓库内唯一的「Agent 上手」权威文档。Codex / 新对话克隆本仓库后，**先读这个**。
> 项目定位：**Kelly Personal Marketing Intelligence OS**（市场营销 / 品牌 / 美妆 / 奢侈品 / 科技 / 零售行业情报档案馆）。
> 铁律：**禁止任何假内容**，所有资讯必须来自真实 Source / Supabase；不要继续大改页面视觉，优先建数据关系与修 bug。

---

## 1. 仓库与线上环境

| 项 | 值 |
|---|---|
| 本地路径 | `/Users/apple/WorkBuddy/2026-08-04-14-32-19/work-archive-next/`（Mac 工作区，非部署目标） |
| GitHub | `https://github.com/shakekhan0425/Kelly-s-work-archive` · 分支 `main` |
| 线上站点（Vercel，自动部署 main） | `https://kelly-s-work-archive.vercel.app` |
| Supabase 项目 ref | `xecllrzcdalpxbxekunm` · URL `https://xecllrzcdalpxbxekunm.supabase.co` |
| 构建状态 | Next.js 16（App Router）+ React 19，标准 SSR 部署（**非** `output:export`），运行时直读 Supabase |

> **单一真相源 = GitHub `main`**。任何修改先 commit 再 push；Vercel 监听 `main` 自动构建部署。

---

## 2. 本地构建 / 运行（必读：有两个坑）

```bash
npm install
npm run dev          # http://localhost:3000（未配置 Supabase 时自动回退本地 JSON，可开发）
npm run build        # 生产构建
```

### ⚠️ 坑 1：构建必须清空 NODE_OPTIONS
WorkBuddy 注入的 `NODE_OPTIONS=--require=... --use-system-ca` 会让 Next 16 Turbopack Worker 报错 `ERR_WORKER_INVALID_EXEC_ARGV`。
**构建命令一律**：

```bash
NODE_OPTIONS="" npm run build
```

### ⚠️ 坑 2：Vercel 构建期「顶层副作用」铁律（本地绿、Vercel 红的唯一根因）
Vercel 在「收集页面数据」阶段会**求值** route 静态 `import` 的所有模块的顶层代码；本地 `next build` 不触发。
> **任何被 Next route 直接或间接静态 import 的模块，绝不能在模块顶层 `createClient(...)` 实例化 Supabase 客户端**（构建期 env 未注入 → `supabaseKey is required` → 整条部署失败）。

✅ 正确范式：一律用 `pipeline/lib/supabase.ts` 的 `getSupabaseAdmin()` —— 函数体内**懒加载** `createClient`。
✅ 前端读用 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`（已配，站点能显示）；写入用 `SUPABASE_SERVICE_ROLE_KEY`（机密）。

### ⚠️ 坑 3：Server Component 禁用 `onError`
服务端组件（async server component，如 `/desk`）渲染带 `onError` 的 `<img>` 会预渲染失败。
✅ 图片兜底组件：客户端用 `src/components/archive/ImageWithFallback.tsx`；**server component 内**用 `ServerImage.tsx`（已是 Client Component，带 onError 兜底）。

---

## 3. 数据流架构（当前真实状态）

```
Supabase(实时真相)  ←写入—  采集管线(GitHub Actions / 本地 tsx)
        ↑ 运行时直读
   Next.js 页面(SSR, ISR revalidate=300)
        ↑ 仅缓存
   localStorage(UI 偏好 / 滚动 / 临时缓存，非正式库)
```

- 页面运行时直读 Supabase（`src/lib/data/live.ts`）；localStorage **只**存 UI 偏好/滚动/临时缓存。
- 信号详情 404 兜底：`getItemByIdLive` 在 archive 缓存 miss 时直接查 Supabase 单表。
- 微信文章经 pipeline 处理到 `PUBLISHED` 后 upsert 进 `signals` 表，自动进 Desk / Signals。

### 环境变量（`.env.local`，已被 gitignore；勿提交）
```
SUPABASE_URL=https://xecllrzcdalpxbxekunm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role，机密>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon，已配>
DEEPSEEK_API_KEY=<可选，AI 萃取>
```
> Vercel 侧需补 `SUPABASE_SERVICE_ROLE_KEY`（Production 作用域）让服务端写入/cron 可用；`NEXT_PUBLIC_SUPABASE_URL` 已配。

---

## 4. 采集管线（如何自动更新内容）

脚本在 `pipeline/`（`tsx` 运行），共享模块 `pipeline/lib/ingest-shared.ts`：

| 脚本 | 写入表 | 说明 |
|---|---|---|
| `npm run ingest:web` | `signals` | RSS/Atom 抓取（原生解析 + article-extractor 兜底），无 LLM |
| `npm run ingest:sites` | `signals` | 中文营销站 HTML 列表→详情 |
| `npm run ingest:cases` | `cases` | 中文案例站 HTML |
| `npm run mark:live` | `sources` | 把有内容的源标 `is_active=true` |

- 每个 runner 支持 `INGEST_BUDGET_MS` 时间预算；超预算干净退出，已写入条目逐条 upsert 不脏库。
- **自动触发**：`.github/workflows/ingest.yml`（GitHub Actions 每 6h 跑，GitHub 出口能正常访问那些源；**Vercel 服务器出口被源站拦截，旧 Vercel Cron 已废弃**）。
- 本地手动跑：`NODE_OPTIONS="" SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run ingest:web`

### 🔴 已知待办：ingest.yml 缺少超时修复（未推送）
当前 GitHub 上的 `ingest.yml` 是旧版：`ingest-web` 无 `timeout-minutes`、无 `continue-on-error`，且脚本无限时间预算。
**根因**：`@extractus/article-extractor` 的 `extract(url)` 不响应 AbortController，曾在 GitHub Runner 上无限挂死，导致 workflow 卡 21min+。
**已修代码**（commit `7c6a246`）：`ingest-shared.ts` 加了 `withTimeout()`，`ingest-web.ts` 给 `extract/fetchText` 套 12s 超时。
**还差一步**：把下面的 workflow 文件替换为修复版——但推送 `.github/workflows/*.yml` 需要 GitHub token 带 **`workflow` scope**（当前 WorkBuddy 用的 PAT 缺这个 scope，push 会被拒）。请 Codex 用带 workflow scope 的 token 推送，或直接在 GitHub 网页编辑该文件：

```yaml
name: Ingest (Supabase)
on:
  schedule:
    - cron: "0 */6 * * *"
  workflow_dispatch: {}
concurrency:
  group: ingest
  cancel-in-progress: false
jobs:
  ingest:
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Ingest RSS/Atom (web)
        run: npm run ingest:web
        timeout-minutes: 16
        continue-on-error: true
        env:
          INGEST_BUDGET_MS: 900000
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - name: Ingest Chinese marketing sites
        run: npm run ingest:sites
        timeout-minutes: 9
        continue-on-error: true
        env:
          INGEST_BUDGET_MS: 480000
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - name: Ingest Chinese case sites
        run: npm run ingest:cases
        timeout-minutes: 9
        continue-on-error: true
        env:
          INGEST_BUDGET_MS: 480000
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
      - name: Mark live sources
        run: npm run mark:live
        timeout-minutes: 3
        continue-on-error: true
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```
GitHub Secrets 需配置：`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`（用户需在 GitHub 网页 Settings → Secrets 添加）。

---

## 5. 微信公众号自动接入（已构建，待用户点亮；勿重复造轮子）

架构：**Wechat2RSS 私有云(Sealos/Railway) → Supabase Cron(pg_cron) → Edge Function → Supabase → Archive**。
交付物（commit `80a9e35`）：
- `supabase/migrations/0003_wechat_pipeline.sql`（wechat_sources / wechat_articles / sync_jobs 三表 + 幂等唯一键 + RLS + seed 12 个公众号）
- `supabase/migrations/0004_cron.sql`（pg_cron 每 8 分钟 ingest / 每 15 分钟 process；**`CRON_SECRET` 为占位符 `<CRON_SECRET>`，执行前需替换成强随机值**）
- `supabase/functions/ingest-wechat` + `process-wechat` + `_shared/{db,rss,canon,ai}.ts`（Deno 边缘函数）
- `deploy/wechat2rss/{docker-compose,railway.toml,Dockerfile,README.md}`（云端部署，不在 Mac）
- `src/components/archive/WechatSourcesPanel.tsx`（Sources 页实时状态面板：connected/healthy/rate_limited/auth_required/failed/paused）

**仍需用户执行**：① 云端部署 Wechat2RSS（拿 Admin URL、确认持久卷）② Supabase SQL Editor 跑 0003+0004 ③ 部署 2 个 Edge Function + 设 Secrets ④ 微信扫码登录 + 订阅 ⑤ Vercel env 加 `NEXT_PUBLIC_SUPABASE_URL`。

---

## 6. 已知问题与待办（按优先级）

1. 🔴 **ingest.yml 超时修复未推送**（见 §4，需 workflow scope token）。
2. 🔴 **手机打不开 `vercel.app`**：`*.vercel.app` 在中国大陆移动网络普遍被墙。唯一根治 = 绑自定义域名（CNAME 到 Vercel，¥60–80/年）。PWA 已就绪，域名一绑即可「添加到主屏幕」当 App。
3. 🟡 **密钥卫生**：曾误把 `SUPABASE_SERVICE_ROLE_KEY` 与 DeepSeek key 明文写进仓库（已 amend 推送，远程无泄露）。建议用户在 Supabase / DeepSeek 后台**轮换**这两个密钥，并在 Supabase Secrets 与 `.env.local` 同步更新（尤其若 Codex 要部署 Edge Function）。
4. 🟡 **部分 RSS 源 URL 已失效**（marketingbrew / campaign / thedrum / adobe / voguebusiness / 36kr / huxiu / yicai / wallstreetcn / pedaily / hbr / bain / bcg 等 404/403）——registry 的 `rss` 字段待修正。
5. 🟡 沙箱不可达 / 需付费墙未自动接入：刀法、青眼（Cloudflare 拦截）；36氪、虎嗅（SPA 无静态 RSS）；晚点、笔记侠、化妆品财经在线（newsletter/登录）——在 registry 标 `live:false`，属规划来源，非假内容。

---

## 7. 修改前 checklist（避免重复踩坑）

- [ ] 改任何被路由 import 的模块？**不要**在里面顶层 `createClient`，用 `getSupabaseAdmin()`。
- [ ] 加图片兜底？server component 用 `ServerImage`，client component 用 `ImageWithFallback`。
- [ ] 构建？`NODE_OPTIONS="" npm run build`。
- [ ] 碰 `.github/workflows/*.yml`？需要 workflow scope token，否则 push 被拒（改用网页编辑）。
- [ ] 任何密钥？**只放** Supabase Secrets / GitHub Secrets / 本地 `.env.local`（gitignore），绝不明文进仓库（GitHub secret scanning 会拦截并可能回滚）。
- [ ] 提交前：`git status` 确认无密钥泄露；`npm run build` 本地先过一遍（27 个路由）。

---

## 8. 关键文件速查

| 文件 | 作用 |
|---|---|
| `src/lib/data/live.ts` | 运行时读 Supabase + 本地 JSON 回退、404 兜底 |
| `src/lib/data/sources.registry.ts` | 信源登记表（RSS/类型/状态） |
| `src/lib/data/types.ts` | ArchiveItem / SourceIntel 等类型 |
| `src/components/archive/ImageWithFallback.tsx` / `ServerImage.tsx` | 图片兜底（客户端 / 服务端） |
| `pipeline/lib/ingest-shared.ts` | 采集共享工具（HTTP/超时/分类/Supabase 客户端） |
| `pipeline/ingest-*.ts` | 三个抓取脚本 |
| `supabase/migrations/0001..0004_*.sql` | 建表 + RLS + Cron |
| `supabase/functions/*` | Deno 边缘函数（微信接入） |
| `deploy/wechat2rss/*` | 微信云端部署产物 |
| `src/app/sources/page.tsx` + `WechatSourcesPanel.tsx` | Sources 页与微信状态面板 |
| `vercel.json` | 已去除 crons（旧 Vercel Cron 废弃） |
| `README.md` / `README-DEPLOY.md` / `DATA_FLOW_AUDIT.md` | 原有说明文档 |

---

## 9. 验收状态（截至 2026-08-08）

| 项 | 状态 |
|---|---|
| 网站部署 / 破图 / 演示用户 / 空白设置 | ✅ 已修复并上线 |
| 数据今日更新（Supabase 已补到 8/8） | ✅ |
| 非微信 RSS 自动更新（GitHub Actions） | 🟡 代码就绪，workflow 超时修复待推送 |
| 微信公众号自动接入 | 🟡 代码/迁移就绪，待用户云端部署+建表+扫码 |
| 手机可访问 / App | 🔴 待自定义域名 |
