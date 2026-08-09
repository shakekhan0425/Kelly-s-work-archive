import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import { formatDate, getEnglishLive, liveSource } from "@/lib/data/live";
import { ENGLISH_BRIEFS } from "@/lib/data/english.briefs";

export const metadata = { title: "商务英语 · WORK / Archive" };

export default async function EnglishPage() {
  const cards = await getEnglishLive();
  const src = liveSource();

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
          从真实行业文章中提取的营销 / 商业术语句型与关键词，用于外企表达与面试英语积累。
        </p>
        <p className="en-note">
          说明：「实时语料」来自真实抓取的行业文章原句；「系统化词卡」为通用商务英语整理，
          例句为编者撰写的教学示范，非引用特定文章，亦不编造文章链接。
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
        ) : null}
      </section>

      <SectionHeader eyebrow="Live Corpus" title="实时语料" />
      <p className="en-sub-note">从真实行业文章原句抽取的商业 / 营销术语句型。点卡片右上角「读原文」可跳转来源。</p>
      <div className="en-grid" style={{ marginTop: 12 }}>
        {cards.length > 0 ? (
          cards.map((e) => {
            // 由来源名派生稳定色相，生成杂志风封面
            let h = 0;
            for (const c of e.sourceName) h = (h * 31 + c.charCodeAt(0)) % 360;
            const initial = e.sourceName.trim().charAt(0).toUpperCase();
            const bg = `linear-gradient(135deg, hsl(${h} 42% 46%), hsl(${(h + 34) % 360} 40% 32%))`;
            return (
              <article id={e.id} key={e.id} className="en-card">
                <div className="en-cover" style={{ background: bg }} aria-hidden="true">
                  <span className="en-cover-initial">{initial}</span>
                  <span className="en-cover-tag">实时语料</span>
                </div>
                <div className="en-terms">
                  {e.terms.slice(0, 4).map((t) => (
                    <span key={t} className="en-term">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="en-sentence">"{e.sentence}"</div>
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
                  读原文 ↗
                </a>
              </article>
            );
          })
        ) : (
          <p className="list-dek">暂无英语条目。</p>
        )}
      </div>

      <SectionHeader eyebrow="Curated Vocabulary" title="系统化商务词卡" />
      <p className="en-sub-note">通用商务英语整理，含句型 / 范例 / 面试应用。例句为教学示范，非引用特定文章。</p>
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
                <p className="en-brief-sample">"{b.sample}"</p>
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
    </ArchiveShell>
  );
}
