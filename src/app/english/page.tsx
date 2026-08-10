import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { Pager } from "@/components/archive/Pager";
import { SectionHeader } from "@/components/archive/SectionHeader";
import { formatDate, getEnglishLive, liveSource, paginate } from "@/lib/data/live";
import { ENGLISH_BRIEFS } from "@/lib/data/english.briefs";
import { ENGLISH_PRACTICE } from "@/lib/data/english.practice";

export const metadata = { title: "商务英语 · WORK / Archive" };
export const dynamic = "force-dynamic";

export default async function EnglishPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawPage = typeof sp.p === "string" ? sp.p : "1";
  const page = Math.max(1, parseInt(rawPage, 10) || 1);

  // 新闻语料是可选层；即使实时抓取暂时超时，固定学习内容也必须可用。
  let liveError = false;
  let pageRes = paginate<Awaited<ReturnType<typeof getEnglishLive>>[number]>([], page);
  try {
    pageRes = paginate(await getEnglishLive(), page);
  } catch (e) {
    liveError = true;
    console.error("[english] 实时语料读取失败：", e);
  }
  const src = liveError ? "unknown" : liveSource();

  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader
          eyebrow="Business English"
          title="商务英语"
          action={{ href: "/desk", label: "返回今日" }}
        />
        <p className="list-dek" style={{ maxWidth: "70ch" }}>
          先学能在会议、汇报、邮件和跨部门协作中直接使用的表达；行业新闻原句只作为可选语料，不是学习入口。
        </p>
        <p className="en-note">
          「职场实战卡」是站内可直接学习的内容，不需要跳转外网；「系统化词卡」补充营销、品牌和面试表达；
          「行业原句库」最后更新，适合想看真实语境时再打开。
        </p>
        {src === "supabase" ? (
          <span className="live-badge" title="数据来自 Supabase，实时更新">● 实时</span>
        ) : src === "json" ? (
          <span
            className="live-badge"
            style={{ background: "#eef0f3", color: "#6b7280", borderColor: "#e2e5ea" }}
            title="未连接 Supabase，使用本地归档数据"
          >
            ● 本地档案
          </span>
        ) : liveError ? (
          <span className="live-badge" style={{ background: "#fff4e6", color: "#b35c00", borderColor: "#f2c078" }}>
            实时语料暂时不可用
          </span>
        ) : null}
      </section>

      <SectionHeader eyebrow="Practice First" title="职场商务英语 · 实战卡" />
      <p className="en-sub-note">每张卡都包含：意思、使用场景、可直接套用的句子，以及职场语气提醒。</p>
      <div className="en-practice-grid" style={{ marginTop: 12 }}>
        {ENGLISH_PRACTICE.map((card) => (
          <article id={card.id} key={card.id} className="en-practice-card">
            <div className="en-practice-topline">
              <span className="en-practice-category">{card.category}</span>
              <span className="en-practice-phrase">{card.phrase}</span>
            </div>
            <div className="en-practice-meaning">{card.meaning}</div>
            <p className="en-practice-use">{card.use}</p>
            <div className="en-practice-example">“{card.example}”</div>
            <p className="en-practice-note">{card.note}</p>
          </article>
        ))}
      </div>

      <SectionHeader eyebrow="Curated Vocabulary" title="系统化商务词卡 · 固定学习库" />
      <p className="en-sub-note">营销、品牌、增长和面试中的核心词汇；内容固定，不会因为每日新闻刷新而被替换。</p>
      <div className="en-brief-grid" style={{ marginTop: 12 }}>
        {ENGLISH_BRIEFS.map((b) => {
          let h = 0;
          for (const c of b.term) h = (h * 31 + c.charCodeAt(0)) % 360;
          const bg = `linear-gradient(135deg, hsl(${h} 30% 50%), hsl(${(h + 28) % 360} 32% 36%))`;
          return (
            <article id={b.id} key={b.id} className="en-brief-card">
              <div className="en-brief-cover" style={{ background: bg }} aria-hidden="true">
                <span>{b.term.trim().charAt(0).toUpperCase()}</span>
                <span className="en-brief-cover-tag">系统化词卡</span>
              </div>
              <div className="en-brief-head">
                <span className="en-term">{b.term}</span>
                <span className="en-brief-zh">{b.zh}</span>
              </div>
              <p className="en-brief-def">{b.definition}</p>
              <div className="en-brief-row">
                <span className="en-brief-k">句型</span>
                <p className="en-brief-v">{b.pattern}</p>
              </div>
              <div className="en-brief-row">
                <span className="en-brief-k">范例</span>
                <p className="en-brief-sample">“{b.sample}”</p>
              </div>
              <div className="en-brief-row">
                <span className="en-brief-k">地道表达</span>
                <p className="en-brief-v">{b.corporateLanguage}</p>
              </div>
              <div className="en-brief-row">
                <span className="en-brief-k">面试应用</span>
                <p className="en-brief-v">{b.interviewPitch}</p>
              </div>
              <div className="en-brief-src">来源类别：{b.source}</div>
            </article>
          );
        })}
      </div>

      <SectionHeader eyebrow="Optional Live Corpus" title="行业原句库 · 可选阅读" />
      <p className="en-sub-note">
        以下是从真实行业文章中抽取的句子，用来观察表达在语境中的用法；“读原文”只是可选，不影响站内学习。
      </p>
      {liveError ? (
        <div className="en-live-empty">实时行业语料本次读取超时，固定学习内容仍可正常使用。刷新页面后重试。</div>
      ) : (
        <div className="en-grid" style={{ marginTop: 12 }}>
          {pageRes.items.length > 0 ? (
            pageRes.items.map((e) => {
              let h = 0;
              for (const c of e.sourceName) h = (h * 31 + c.charCodeAt(0)) % 360;
              const initial = e.sourceName.trim().charAt(0).toUpperCase();
              const bg = `linear-gradient(135deg, hsl(${h} 42% 46%), hsl(${(h + 34) % 360} 40% 32%))`;
              return (
                <article id={e.id} key={e.id} className="en-card">
                  <div className="en-cover" style={{ background: bg }} aria-hidden="true">
                    <span className="en-cover-initial">{initial}</span>
                    <span className="en-cover-tag">行业原句</span>
                  </div>
                  <div className="en-terms">
                    {e.terms.slice(0, 4).map((t) => (
                      <span key={t} className="en-term">{t}</span>
                    ))}
                  </div>
                  <div className="en-sentence">“{e.sentence}”</div>
                  <div className="meta-line" style={{ marginTop: 10 }}>
                    <span>{e.sourceName}</span>
                    {e.publishedAt ? (
                      <>
                        <span className="sep">/</span>
                        <span>{formatDate(e.publishedAt)}</span>
                      </>
                    ) : null}
                  </div>
                  <a className="en-read-src" href={e.url} target="_blank" rel="noreferrer">
                    可选：读原文 ↗
                  </a>
                </article>
              );
            })
          ) : (
            <p className="list-dek">暂无行业原句。</p>
          )}
        </div>
      )}
      {!liveError ? <Pager basePath="/english" queryString="" page={pageRes.page} pages={pageRes.pages} /> : null}
    </ArchiveShell>
  );
}
