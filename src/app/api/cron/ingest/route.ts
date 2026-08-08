import { NextRequest, NextResponse } from "next/server";

// 采集由 GitHub Actions 每 6 小时执行；本路由保留为兼容入口，避免把 Node 采集依赖打进 Edge Runtime。
export const dynamic = "force-dynamic";

/**
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

  return NextResponse.json({
    ok: true,
    mode: "github-actions",
    message: "Ingestion runs through the scheduled GitHub Actions pipeline.",
    at: new Date().toISOString(),
  });
}
