/**
 * 流水线 CLI 入口（code-only，不在此环境执行）。
 * 用法（需先配置 .env.local 中的 SUPABASE_* 与 LLM_*）：
 *
 *   tsx pipeline/cli.ts ingest --all
 *   tsx pipeline/cli.ts ingest --source <sourceId>
 *   tsx pipeline/cli.ts import-wechat --url <url> [--mode paste|clip|share] [--html <html>]
 *   tsx pipeline/cli.ts import-newsletter --file <payload.json>
 *   tsx pipeline/cli.ts cron
 *
 * 注：package.json 已加脚本别名：
 *   npm run pipeline:ingest / pipeline:cron / pipeline:seed
 */
import "./lib/env"; // 必须在最前：加载 .env.local 中的密钥
import { ingestAll, ingestSource } from "./lib/ingest";
import { importWechat } from "./lib/import-wechat";
import { importNewsletter } from "./lib/import-newsletter";
import { startScheduler } from "./lib/scheduler";

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i >= 0 && i + 1 < process.argv.length) return process.argv[i + 1];
  return fallback;
}

async function main() {
  const cmd = process.argv[2];
  const sub = process.argv[3];

  if (cmd === "ingest") {
    if (sub === "--all") {
      await ingestAll();
    } else if (sub === "--source") {
      const id = arg("--source");
      if (!id) throw new Error("缺少 --source <id>");
      await ingestSource(id);
    } else {
      console.log("用法: ingest --all | ingest --source <id>");
    }
  } else if (cmd === "import-wechat") {
    const url = arg("--url");
    const mode = (arg("--mode", "paste") as "paste" | "clip" | "share") ?? "paste";
    const html = arg("--html");
    const r = await importWechat({ mode, url, html: html ? await read(html) : undefined });
    console.log("imported:", r);
  } else if (cmd === "import-newsletter") {
    const file = arg("--file");
    if (!file) throw new Error("缺少 --file <payload.json>");
    const payload = JSON.parse(await read(file));
    const r = await importNewsletter(payload);
    console.log("imported:", r);
  } else if (cmd === "cron") {
    startScheduler();
  } else {
    console.log("可用命令: ingest | import-wechat | import-newsletter | cron");
  }
}

import { readFile } from "node:fs/promises";
function read(p: string): Promise<string> {
  return readFile(p, "utf8");
}

main().catch((e) => {
  console.error("执行失败：", e.message);
  process.exit(1);
});
