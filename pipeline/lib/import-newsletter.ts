/**
 * Newsletter 导入（§2.4）：专用邮箱导入。
 * 由邮件转发服务（如 SendGrid Inbound / Cloudflare Email Routing / 自建 IMAP 监听）
 * 将邮件封装为 { from, subject, html, text } 调用本函数。
 * 抽取正文 → 去重 → AI 萃取 → 入库，并登记 imports(channel='newsletter')。
 */
import { getSupabaseAdmin } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { extractFromHtml, type Extracted } from "./extract";
import { ingestExtracted } from "./ingest";

export interface NewsletterInput {
  from: string;
  subject: string;
  html?: string;
  text?: string;
  sourceId?: string; // 对应 sources 表中该 Newsletter 媒体 id
  sourceName?: string;
}

export async function importNewsletter(
  input: NewsletterInput,
  sb: SupabaseClient = getSupabaseAdmin()
): Promise<{ importId: string; articleId?: string }> {
  const { data: imp } = await sb
    .from("imports")
    .insert({
      channel: "newsletter",
      mode: "email",
      payload: input as any,
      status: "pending",
    })
    .select("id")
    .single();
  const importId = imp?.id as string;

  try {
    const html = input.html ?? `<body>${(input.text ?? "").replace(/\n/g, "<br>")}</body>`;
    const ext: Extracted = await extractFromHtml(html);
    if (!ext.title) ext.title = input.subject;
    if (ext.length < 200) throw new Error("Newsletter 正文过短");

    // 来源：优先用入参指定的媒体，否则回退到发件域名推断
    const domain = input.from.split("@")[1] ?? "newsletter";
    const articleId = await ingestExtracted(
      ext,
      {
        sourceId: input.sourceId ?? `nl-${domain}`,
        sourceName: input.sourceName ?? input.from,
        url: `newsletter:${importId}`,
        publishedAt: new Date().toISOString(),
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
