/**
 * 定时采集调度（§2.4）。
 * 采用零依赖的轮询调度：每 INTERVAL_MS 触发一次全量采集。
 * 生产环境更推荐：
 *   - Vercel Cron（见仓库 vercel.json）调用一个受保护的 API 路由；或
 *   - Trigger.dev / GitHub Actions 定时任务；或
 *   - Supabase pg_cron 触发 Edge Function。
 * 此处提供可在任意 Node 进程常驻运行的实现。
 */
import { ingestAll } from "./ingest";

const INTERVAL_MS = Number(process.env.INGEST_INTERVAL_MS ?? 24 * 60 * 60 * 1000); // 默认 24h

export function startScheduler(): void {
  console.log(`[scheduler] 每 ${(INTERVAL_MS / 3_600_000).toFixed(1)}h 执行一次全量采集`);
  const tick = async () => {
    try {
      console.log("[scheduler] 开始采集…");
      await ingestAll();
      console.log("[scheduler] 采集完成");
    } catch (e) {
      console.error("[scheduler] 采集异常：", (e as Error).message);
    }
  };
  void tick(); // 启动时先跑一次
  setInterval(tick, INTERVAL_MS);
}

/**
 * Trigger.dev 任务示例（注释，按需启用）：
 *
 * // trigger.config.ts
 * import { cronTrigger } from "@trigger.dev/sdk";
 * export const dailyIngest = task({
 *   id: "daily-ingest",
 *   cron: { cron: "0 6 * * *", timezone: "Asia/Shanghai" }, // 每天 06:00
 *   run: async () => { await ingestAll(); },
 * });
 */
