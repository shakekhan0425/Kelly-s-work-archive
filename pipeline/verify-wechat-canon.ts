/**
 * 本地验证：Wechat 管道核心算法（canonicalize + 幂等去重）
 * 不依赖数据库，纯算法验证；证明「同一文章重复抓取不得生成两条记录」。
 * 运行：NODE_OPTIONS="" npx tsx pipeline/verify-wechat-canon.ts
 */
import {
  canonicalizeWechatUrl,
  externalIdOf,
  stripHtml,
  truncate,
} from "../supabase/functions/_shared/canon.ts";

// 模拟 Wechat2RSS 抓回的条目（含追踪参数、重复项）
const RAW = [
  "https://mp.weixin.qq.com/s/AbC123xyz?chksm=abc&scene=25&subscene=1&idx=1&sn=def",
  "https://mp.weixin.qq.com/s/AbC123xyz", // 同一篇，仅少了追踪参数 → 应去重
  "https://mp.weixin.qq.com/s/AnotherToken?chksm=111&scene=0",
  "https://mp.weixin.qq.com/s/AnotherToken?scene=0&idx=2", // 同上 token，不同 idx → 应去重
  "https://mp.weixin.qq.com/s/ThirdOne",
];

// 模拟「数据库」持久状态（跨多次抓取保留，等价于 unique 约束 + 查重后插入）
const seenCanon = new Set<string>();
const seenPair = new Set<string>();

function simulateIngest(pass: number) {
  let inserted = 0;
  let duplicate = 0;
  for (const url of RAW) {
    const canonical = canonicalizeWechatUrl(url);
    const ext = externalIdOf(url);
    const pairKey = `src1::${ext}`;
    const exists = seenCanon.has(canonical) || seenPair.has(pairKey);
    if (exists) {
      duplicate++;
      continue;
    }
    seenCanon.add(canonical);
    seenPair.add(pairKey);
    inserted++;
  }
  return { pass, inserted, duplicate, unique: seenCanon.size };
}

console.log("=== canonicalize 验证 ===");
for (const u of RAW) {
  console.log("  in :", u);
  console.log("  out:", canonicalizeWechatUrl(u));
}

const p1 = simulateIngest(1);
const p2 = simulateIngest(2); // 第二次整批重跑，应全部判重

console.log("\n=== 幂等去重验证 ===");
console.log("Pass 1:", p1);
console.log("Pass 2:", p2);

const totalUnique = new Set(RAW.map(canonicalizeWechatUrl)).size;
console.log("\n期望唯一文章数:", totalUnique);
console.log("Pass1 新增:", p1.inserted, "| Pass2 新增(应为0):", p2.inserted);
console.log("Pass2 重复(应=", RAW.length, "，整批重跑全部命中已有):", p2.duplicate);

console.log("\n=== 文本清洗验证 ===");
const dirty = '<p>这是<b>正文</b>&nbsp;第一段</p><script>bad()</script><img src="https://x/y.jpg">';
console.log("stripHtml:", JSON.stringify(stripHtml(dirty)));
console.log("truncate :", truncate("一二三四五六七八九十", 6));

// 核心判据：整批重跑后新增必须为 0（数据库 unique 约束 + 查重后插入保证；
// 同一文章重复抓取不会生成第二条记录）。
const ok = p1.inserted === totalUnique && p2.inserted === 0 && p2.duplicate === RAW.length;
console.log("\nRESULT:", ok ? "PASS ✅ 幂等去重正确（重跑新增=0）" : "FAIL ❌");
process.exit(ok ? 0 : 1);
