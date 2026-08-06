/**
 * 统一 LLM 客户端（OpenAI 兼容）。
 * 通过环境变量配置，支持 OpenAI / DeepSeek / 混元 / 本地兼容端点：
 *   LLM_API_KEY, LLM_BASE_URL, LLM_MODEL
 * 仅用于「真实抓取文本 → 结构化萃取」，绝不编造事实。
 */

// @ts-ignore optional dependency（部署前 npm install openai）
import OpenAI from "openai";

export interface LLMConfig {
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

let _client: any = null;

function client(cfg: LLMConfig = {}): any {
  const apiKey = cfg.apiKey ?? process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY;
  const baseURL = cfg.baseURL ?? process.env.LLM_BASE_URL;
  const model = cfg.model ?? process.env.LLM_MODEL ?? "gpt-4o-mini";
  if (!apiKey) throw new Error("未配置 LLM_API_KEY / OPENAI_API_KEY。");
  if (!_client) {
    // @ts-ignore optional dependency
    _client = new OpenAI({ apiKey, baseURL });
  }
  _client._model = model;
  return _client;
}

export interface ChatOpts {
  temperature?: number;
  json?: boolean;
}

/** 文本补全。json=true 时要求模型返回 JSON 对象。 */
export async function chat(
  system: string,
  user: string,
  opts: ChatOpts = {}
): Promise<string> {
  const c = client();
  const messages: any[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
  const res = await c.chat.completions.create({
    model: c._model,
    messages,
    temperature: opts.temperature ?? 0.2,
    ...(opts.json ? { response_format: { type: "json_object" } } : {}),
  });
  return res.choices?.[0]?.message?.content ?? "";
}

/** 解析 JSON 响应，容错。 */
export async function chatJSON<T = any>(
  system: string,
  user: string,
  opts: ChatOpts = {}
): Promise<T> {
  const raw = await chat(system, user, { ...opts, json: true });
  try {
    return JSON.parse(raw) as T;
  } catch {
    // 容错：尝试抽取首个 {...}
    const m = raw.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]) as T;
    throw new Error("LLM 未返回合法 JSON：" + raw.slice(0, 200));
  }
}
