# Wechat2RSS 私有云部署手册

> 目标架构：**Wechat2RSS(Private Cloud) → Supabase Cron → Edge Function → Supabase DB → WORK / Archive**
> 本组件只负责「微信侧」：把公众号文章转成 RSS，供 Supabase 的 Edge Function 抓取。
> **不在你的 Mac 上运行**——部署到云端容器（Sealos / Railway / 任意支持 Docker 的平台）。

---

## 0. 前置说明（重要）

- Wechat2RSS 的**微信登录由你本人完成**：部署好后，打开它的网页管理端，用微信扫码登录。
  **Agent 不会、也不需要你的微信 Cookie / Session / 密码。**
- 必须挂载**持久卷**：容器重启后，订阅列表和登录态不能丢（否则每天要重新扫码）。
- 当前官方镜像为 `tttmr/wechat2rss:latest`，端口为 `8080`，持久化目录为 `/wechat2rss`。

---

## 1. 部署到云端（二选一）

### A. Sealos（推荐，国内访问稳）

1. 打开 Sealos 控制台 → **应用 / 容器** → 新建。
2. 镜像填：`tttmr/wechat2rss:latest`
3. 端口：容器端口 `8080`，对外暴露 `8080`。
4. **存储卷**：添加持久卷，容器内路径填 `/wechat2rss`（容量 1–5 GB 足够）。
5. 环境变量：`RSS_HTTPS=1`、`TZ=Asia/Shanghai`；私有部署按官方要求填写 `LIC_EMAIL` / `LIC_CODE`。
6. 部署，等状态变「运行中」。

> Sealos 也支持直接上传 `docker-compose.yml`（本目录已提供），在「Compose 应用」里导入即可，
> 它会自动把 `wechat2rss-data` 卷持久化。

### B. Railway

1. 新建 Project → 选 **Deploy from GitHub repo**，指向包含本目录的仓库；
   或直接 `railway up`（读取 `railway.toml` + `Dockerfile`）。
2. 在 Railway Dashboard 给该服务**添加 Volume**：Mount Path = `/wechat2rss`。
3. 环境变量：`RSS_HTTPS=1`、`TZ=Asia/Shanghai`；如需绑定固定 RSS 地址，增加 `RSS_HOST`。
4. 部署完成后，Railway 会给你一个 `*.railway.app` 域名。

---

## 2. 验收：部署是否成功（STEP 1 输出项）

| 验收项 | 怎么看 | 期望 |
|---|---|---|
| **Wechat2RSS Admin URL** | 平台给你的域名（Sealos/ Railway 分配的） | 能打开网页管理端 |
| **Health Status** | `curl https://<你的域名>/` 返回 `200` | 健康 |
| **Version** | 访问 `/version` 或管理端页脚 | 记下版本号 |
| **Persistent Storage** | 重启容器后，订阅与登录态仍在 | 数据目录落在持久卷 |

---

## 3. 登录与订阅（你本人操作）

1. 浏览器打开 **Admin URL**。
2. 用**微信扫码登录**（页面会显示登录二维码）。登录态落在持久卷，重启不丢。
3. 在管理端**添加公众号**，两种均可：
   - 按**公众号 ID**（如 `wx1234567890abcdef`）；
   - 按**文章链接**粘贴一篇该公众号的文章 URL，Wechat2RSS 会自动识别账号。
4. 订阅完成后，Wechat2RSS 会为每个账号生成 RSS：
   - 单账号：`https://<你的域名>/feed/<biz_id>.xml`
   - 聚合：`https://<你的域名>/feed/all.xml?k=<RSS_TOKEN>`

> Edge Function 会通过 `/list?k=<RSS_TOKEN>` 自动读取已订阅账号，并保存每个账号的 RSS 地址；不需要手动逐条填写 `wechat_sources.feed_url`。

---

## 4. Supabase 配置（设置 Secrets）

在 **Supabase Dashboard → Project Settings → Edge Functions / Secrets** 增加：

| Key | 值 |
|---|---|
| `WECHAT2RSS_BASE_URL` | `https://<你的域名>`（不要结尾斜杠） |
| `WECHAT2RSS_TOKEN` | Wechat2RSS 的 `RSS_TOKEN`，用于读取订阅列表 |
| `CRON_SECRET` | `<你的 CRON_SECRET>`（与 0004_cron.sql 中的值保持一致；请自行生成强随机值） |
| `SUPABASE_URL` | `https://xecllrzcdalpxbxekunm.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | `<你的 SERVICE_ROLE_KEY>`（Supabase Dashboard → Settings → API 复制；**切勿提交到仓库**） |
| `LLM_API_KEY` | `<你的 LLM_API_KEY>`（AI 萃取，可选） |
| `LLM_BASE_URL` | `https://api.deepseek.com/v1`（可选） |
| `LLM_MODEL` | `deepseek-chat`（可选） |

> ⚠️ 安全：上表值均为**占位符**，请到 Supabase Dashboard 的 Secrets 里填你自己的真实值。
> 仓库只放变量名、不放密钥明文。若任何密钥此前已泄露，请立即在 Supabase / DeepSeek 后台轮换。

扫码并订阅后，Edge Function 会自动把账号 ID、名称和 `/feed/<id>.xml` 写入 `wechat_sources`。

---

## 5. 部署 Edge Functions + 建表 + 开 Cron

见仓库根 `supabase/migrations/` 与 `supabase/functions/` 的说明（在 Supabase Dashboard 的
SQL Editor 执行 `0003_wechat_pipeline.sql` 和 `0004_cron.sql`；用 Supabase CLI 或 Dashboard 部署
`ingest-wechat` 与 `process-wechat` 两个函数）。

完成后：Supabase Cron 每 8 分钟抓微信 → 每 15 分钟做 AI 处理并发布到 Desk / Signals。
