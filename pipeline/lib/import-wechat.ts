/**
 * 公众号导入（§2.4）：
 *   - paste   : 粘贴文章链接（URL）→ 抓取
 *   - clip    : 正文剪藏（粘贴 HTML / 正文）→ 直接抽取
 *   - share   : 手机分享卡片链接 → 等同 paste
 * 结果写入 imports 表（channel='wechat'），并触发抽取 → 去重 → 萃取 → 入库。
 */
import { getSupabaseAdmin } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractFromUrl, extractFromHtml, type Extracted } from "./extract";
import { ingestExtracted } from "./ingest";

export interface WechatImportInput {
  mode: "paste" | "clip" | "share";
  url?: string;
  html?: string;
  title?: string;
  sourceId?: string; // 不传则写入通用「微信导入」来源
  sourceName?: string;
  publishedAt?: string | null;
}

const WECHAT_SOURCE = {
  id: "wechat-import",
  name: "微信公众号（导入）",
};

export async function importWechat(
  input: WechatImportInput,
  sb: SupabaseClient = getSupabaseAdmin()
): Promise<{ importId: string; articleId?: string }> {
  // 1) 登记导入记录
  const { data: imp } = await sb
    .from("imports")
    .insert({
      channel: "wechat",
      mode: input.mode,
      payload: input as any,
      status: "pending",
    })
    .select("id")
    .single();
  const importId = imp?.id as string;

  try {
    let ext: Extracted;
    if (input.mode === "clip" && input.html) {
      ext = await extractFromHtml(input.html, input.url);
      if (input.title) ext.title = input.title;
    } else if (input.url) {
      ext = await extractFromUrl(input.url);
    } else {
      throw new Error("缺少 url 或 html");
    }
    if (ext.length < 200) throw new Error("抽取正文过短，疑似非文章页");

    const articleId = await ingestExtracted(
      ext,
      {
        sourceId: input.sourceId ?? WECHAT_SOURCE.id,
        sourceName: input.sourceName ?? WECHAT_SOURCE.name,
        url: input.url ?? `wechat:${importId}`,
        publishedAt: input.publishedAt,
        kind: "signal",
      },
      sb
    );

    await sb.from("imports").update({ status: "processed" }).eq("id", importId);
    return { importId, articleId };
  } catch (e) {
    await sb.from("imports").update({ status: "failed" }).eq("id", importId);
    throw e;
  }
}
