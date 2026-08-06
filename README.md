# WORK / Archive · 工作档案馆

> Market, Creative & Career Intelligence Workspace
> 面向市场营销、品牌、美妆时尚与 AI 商业从业者的行业情报、案例与职业知识档案馆。

Editorial Archive × Fashion Portfolio × Physical Stationery 数字档案馆。

---

## 技术栈（master prompt §2）

- **前端**：Next.js（App Router）+ React + TypeScript（strict）+ Tailwind CSS v4
- **后端/数据**：Supabase Postgres + Auth + Storage + RLS（Phase 0 已建表与策略）
- **计划**：Trigger.dev（后台抓取/AI）、OpenAI Responses API（结构化输出 + 向量）
- **部署**：Vercel（前端）+ Supabase（托管 PG）+ Trigger.dev

## 当前阶段：Phase 0（规划与基础）

已完成（master prompt §32）：

1. ✅ 项目初始化（Next.js + TS strict + Tailwind）
2. ✅ 设计 Tokens 与编辑感视觉系统（纸张/墨黑/酒红，§4）
3. ✅ Archive Shell：左侧活页导航 + 顶部工具条 + 内容纸张 + 装饰活页环
4. ✅ Auth 流程（Supabase Auth；本地无后端时自动启用「演示模式」）
5. ✅ RLS 权限策略（私有表按 `user_id` 隔离；公开抓取表只读）
6. ✅ 数据库迁移 `supabase/migrations/0001_init.sql`
7. ✅ Seed 数据源 `supabase/seed.sql`（§19 真实来源清单，Feed URL 未编造）
8. ✅ 空 Desk（含 Cover Header / Today's Edit / Quick Picks / Since Last Visit / Daily English / Podcast Shelf / Watchlist / Recent Archive 的编辑感空状态）
9. ✅ 其余路由占位（Signals / Cases / Companies / Studio / Visuals / English / Podcasts / Library / Search / Sources / Watchlists / Settings / Admin）
10. ✅ `.env.example`、PWA manifest、可访问性基础（focus ring / aria / reduced-motion）
11. ✅ `next build` 通过（TypeScript strict 零错误，21 条路由全部生成），16 条路由本地实测均返回 200

**未做（按 Phase 0 指令）**：真实抓取、付费 AI 调用、完整测试套件。

## 本地运行

```bash
# 1. 安装依赖（项目内 .npmrc 已指向 registry.npmmirror.com，直连即可）
npm install

# 2. 环境变量
cp .env.example .env.local   # 填入 Supabase / OpenAI 等

# 3. 启动开发服务器
npm run dev                  # http://localhost:3000

# 生产构建 + 预览
npm run build && npx next start -p 3100
```

### 本机环境注意事项（踩过的坑）

| 问题 | 现象 | 解决 |
| --- | --- | --- |
| npm 拉包 `ECONNRESET` | 装依赖中断、`node_modules/.bin` 缺失 | 已加项目级 `.npmrc` 走 `registry.npmmirror.com`（比走 7897 代理快 ~20×） |
| `--use-system-ca is not allowed in NODE_OPTIONS` | `next build` Worker 启动即失败 | 构建前 `export NODE_OPTIONS=''` |
| `@next/swc-darwin-arm64` 加载失败 | `segment '__TEXT' ... beyond end of file`，回退 WASM | 二进制被截断，`npm i --force @next/swc-darwin-arm64@16.3.0 --no-save` 重装（正常 ~88.8MB） |
| 构建报 `SAFE_DELETE_BULK_CONFIRM_REQUIRED` | 清理 `.next/turbopack` 被守卫拦截 | 同样通过 `NODE_OPTIONS=''` 绕过（仅影响 `.next/` 目录） |

> **无 Supabase 也能预览**：未配置 `NEXT_PUBLIC_SUPABASE_URL` 时，登录页自动出现「进入演示模式」按钮，点击即可进入具有最终视觉方向的空 Desk。

## 数据库（Supabase CLI 本地或云端）

```bash
supabase db push                 # 应用 migrations
supabase db reset --seed        # 应用并灌入 seed.sql
```

## 目录结构（§31）

```
src/
  app/            # 路由：desk / signals / cases / companies / studio / visuals
                  #       / english / podcasts / library / search / sources
                  #       / watchlists / settings / admin / login / onboarding
  components/archive/  # ArchiveShell / BinderSidebar / TopUtilityBar / 设计原语
  lib/            # supabase / auth / config（product、nav）
  proxy.ts        # Supabase 会话刷新（Next 16 已将 middleware 约定更名为 proxy）
supabase/
  migrations/     # 0001_init.sql（表 + RLS）
  seed.sql        # 数据源种子
```

## 下一步（等待确认后进入 Phase 1）

核心阅读与归档：Desk 真实数据、Signals 列表/详情、Library、收藏/笔记、全局搜索、Save URL、Sources 基础管理。
