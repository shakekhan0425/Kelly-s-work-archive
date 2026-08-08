// 共享：调用 OpenAI 兼容 LLM 萃取微信文章结构化情报
// 环境变量（在 Supabase 中配置 Secrets）：
//   LLM_API_KEY / LLM_BASE_URL / LLM_MODEL
// 未配置 key 时返回 null（process-wechat 仍可发布，仅缺少 AI 萃取）。

export interface WechatAiResult {
  summary: string;
  key_facts: string[];
  industry: string;
  topic: string[];
  brand: string[];
  company: string[];
  marketing_insight: string;
  consumer_insight: string;
  trade_off: string;
  related_cases: string[];
  business_english: { term: string; definition: string }[];
}

const SYSTEM = `你是营销情报分析师。阅读一篇微信公众号文章，输出严格 JSON（不要 markdown 代码块），
字段：summary(中文一句话摘要,≤60字), key_facts(≤5条要点数组), industry(所属行业),
topic(≤4个话题标签数组), brand(文中提及品牌数组), company(相关公司数组),
marketing_insight(营销洞察,≤80字), consumer_insight(消费者洞察,≤80字),
trade_off(权衡/取舍,≤60字), related_cases(可关联案例名数组), 
business_english(≤3个商务英语术语[{term,definition}])。`;

export async function callLLM(
  title: string,
  content: string,
): Promise<WechatAiResult | null> {
  const key = Deno.env.get("LLM_API_KEY");
  const base = Deno.env.get("LLM_BASE_URL");
  const model = Deno.env.get("LLM_MODEL") || "deepseek-chat";
  if (!key || !base) return null;

  const prompt = `标题：${title}\n\n正文：\n${content.slice(0, 4000)}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 25000);
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`LLM ${res.status}`);
    const json = await res.json();
    const text = json?.choices?.[0]?.message?.content;
    if (!text) return null;
    const parsed = JSON.parse(text);
    return {
      summary: String(parsed.summary || "").slice(0, 200),
      key_facts: Array.isArray(parsed.key_facts) ? parsed.key_facts.map(String).slice(0, 5) : [],
      industry: String(parsed.industry || ""),
      topic: Array.isArray(parsed.topic) ? parsed.topic.map(String).slice(0, 4) : [],
      brand: Array.isArray(parsed.brand) ? parsed.brand.map(String).slice(0, 8) : [],
      company: Array.isArray(parsed.company) ? parsed.company.map(String).slice(0, 8) : [],
      marketing_insight: String(parsed.marketing_insight || "").slice(0, 300),
      consumer_insight: String(parsed.consumer_insight || "").slice(0, 300),
      trade_off: String(parsed.trade_off || "").slice(0, 200),
      related_cases: Array.isArray(parsed.related_cases) ? parsed.related_cases.map(String).slice(0, 5) : [],
      business_english: Array.isArray(parsed.business_english)
        ? parsed.business_english.slice(0, 3).map((x: any) => ({
            term: String(x?.term || ""),
            definition: String(x?.definition || ""),
          }))
        : [],
    };
  } catch (e) {
    console.error("[ai] call failed:", String(e));
    return null;
  } finally {
    clearTimeout(t);
  }
}
