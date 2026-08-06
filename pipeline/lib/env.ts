/**
 * 环境变量加载器（仅流水线运行时需要）。
 * Next.js 会自动读 .env.local，但用 `tsx` 跑 Node 脚本时不会。
 * 这里手动加载：.env.local 优先，.env 补缺。两者都被 gitignore。
 */
import { config } from "dotenv";
import { resolve } from "node:path";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
