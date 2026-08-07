import type { CompanyDossier } from "./types";
import { BATCH1 } from "./companies/raw/batch1";
import { BATCH2 } from "./companies/raw/batch2";
import { BATCH3 } from "./companies/raw/batch3";
import { BATCH4 } from "./companies/raw/batch4";
import { BATCH5 } from "./companies/raw/batch5";
import { BATCH6 } from "./companies/raw/batch6";
import { BATCH7 } from "./companies/raw/batch7";
import { BATCH8 } from "./companies/raw/batch8";

/**
 * Company Dossier 库（v3）。
 *
 * 由 8 个研究批次（batch1–batch8）聚合而成，覆盖 9 大分类、约 80 家公司：
 *   Tier A  = 深度档案（≥90% 字段完整）
 *   Tier B  = 基础档案（≥60% 字段完整）
 *   watchlist = 观察池（不进入首页推荐）
 * 旗下具体品牌 / 产品 / Campaign 进入 Brand Casebook，本表以集团与公司为主。
 *
 * 原则：内容为真实公开事实（成立与上市节点、业务模式、收入逻辑、品牌组合、中国策略等）；
 *     缺失字段在详情页如实标注「档案未完成」，绝不编造。
 */

const TIER_ORDER: Record<CompanyDossier["tier"], number> = { A: 0, B: 1, watchlist: 2 };

const byId = new Map<string, CompanyDossier>();
for (const d of [...BATCH1, ...BATCH2, ...BATCH3, ...BATCH4, ...BATCH5, ...BATCH6, ...BATCH7, ...BATCH8]) {
  if (!byId.has(d.id)) byId.set(d.id, d);
}

export const COMPANY_REGISTRY: CompanyDossier[] = Array.from(byId.values()).sort(
  (a, b) => (TIER_ORDER[a.tier] - TIER_ORDER[b.tier]) || a.name.localeCompare(b.name),
);
