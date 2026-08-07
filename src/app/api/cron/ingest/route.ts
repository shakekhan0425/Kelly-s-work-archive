import { NextRequest, NextResponse } from "next/server";
import { runWebIngest } from "@pipeline/ingest-web";
import { runSitesIngest } from "@pipeline/ingest-sites";
import { runCasesIngest } from "@pipeline/ingest-cases";
import { runMarkLive } from "@pipeline/mark-live";

// 采集是重 CPU / 网络任务，必须 Node runtime；且每次请求实时抓取，禁用静态。
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Vercel 函数超时：Hobby 上限 60s、Pro 上限 300s。超过套餐上限会直接导致 BUILD 失败、
// 站点停在旧部署不更新。因此这里取保守的 60s（Hobby/Pro 都安全）；若在 Pro 上想跑满，
// 可改回 300，并用 CRON_BUDGET_MS 控制单次预算。
export const maxDuration = 60;

/** 留给响应序列化和收尾的安全余量。 */
const SAFETY_MS = 20_000;
/** 无显式 budget 时的总预算；可用环境变量 CRON_BUDGET_MS 覆盖（Hobby 建议设 45000）。 */
const DEFAULT_BUDGET_MS = Number(process.env.CRON_BUDGET_MS) || 240_000;

/**
 * Vercel Cron 目标（见仓库 vercel.json：/api/cron/ingest，默认每日 06:00）。
 *
 * 查询参数：
 *   job    = all | web | sites | cases | live   （默认 all）
 *   budget = 总时间预算毫秒（默认 CRON_BUDGET_MS 或 240000）
 *   offset = 源分片起始下标（默认按天轮转，保证长期覆盖全部源）
 *   limit  = 本次最多处理几个源
 *
 * 鉴权：
 *  - Vercel 自家 Cron 调用会带 x-vercel-cron: 1 头，直接放行；
 *  - 手动/本地触发用 ?secret=<CRON_SECRET> 或 Authorization: Bearer <CRON_SECRET>；
 *  - 未配置 CRON_SECRET 时仅本地开发放行（生产务必配置）。
 */
function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // 未配置：开发放行
  if (req.headers.get("x-vercel-cron") === "1") return true;
  const provided =
    req.nextUrl.searchParams.get("secret") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";
  return provided === secret;
}

/** 按天轮转的默认分片起点：预算不够跑全量时，保证不同日子从不同源开始，长期全覆盖。 */
function dayOffset(): number {
  return Math.floor(Date.now() / 86_400_000) * 7;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams;
  const job = (q.get("job") ?? "all").toLowerCase();
  // 预算硬性不超过函数超时（maxDuration*1000）减去收尾安全余量，避免被 Vercel 硬杀。
  const requested = Number(q.get("budget")) || DEFAULT_BUDGET_MS;
  const totalBudget =
    Math.max(5_000, Math.min(requested, maxDuration * 1000)) - SAFETY_MS;
  const offset = q.has("offset") ? Number(q.get("offset")) : dayOffset();
  const limit = q.has("limit") ? Number(q.get("limit")) : undefined;

  const started = Date.now();
  const lines: string[] = [];
  const log = (s: string) => { lines.push(s); console.log(s); };
  const left = () => totalBudget - (Date.now() - started);

  try {
    const out: Record<string, unknown> = {};

    // 案例站最少、最快，先跑；然后中文站；RSS 量最大放最后吃剩余预算。
    if (job === "all" || job === "cases") {
      out.cases = await runCasesIngest({
        budgetMs: job === "all" ? Math.min(left(), totalBudget * 0.25) : left(),
        offset, limit, log,
      });
    }
    if (job === "all" || job === "sites") {
      out.sites = await runSitesIngest({
        budgetMs: job === "all" ? Math.min(left(), totalBudget * 0.25) : left(),
        offset, limit, log,
      });
    }
    if (job === "all" || job === "web") {
      out.web = await runWebIngest({ budgetMs: left(), offset, limit, log });
    }
    if (job === "all" || job === "live") {
      out.live = await runMarkLive(log);
    }

    const added =
      (((out.cases as { added?: number })?.added) ?? 0) +
      (((out.sites as { added?: number })?.added) ?? 0) +
      (((out.web as { added?: number })?.added) ?? 0);

    return NextResponse.json({
      ok: true,
      job,
      at: new Date().toISOString(),
      durationMs: Date.now() - started,
      added,
      ...out,
      log: lines,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, job, error: (e as Error).message, durationMs: Date.now() - started, log: lines },
      { status: 500 }
    );
  }
}
