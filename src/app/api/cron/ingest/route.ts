import { NextRequest, NextResponse } from "next/server";
import { ingestAll } from "@pipeline/lib/ingest";

// 采集是重 CPU / 网络任务，必须 Node runtime；且每次请求实时抓取，禁用静态。
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Pro 套餐函数超时上限 300s；单次全量采集较长，留足预算。
export const maxDuration = 300;

/**
 * Vercel Cron 目标（见仓库 vercel.json：/api/cron/ingest，默认每日 06:00）。
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

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const started = Date.now();
  try {
    await ingestAll();
    return NextResponse.json({
      ok: true,
      at: new Date().toISOString(),
      durationMs: Date.now() - started,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message, durationMs: Date.now() - started },
      { status: 500 }
    );
  }
}
