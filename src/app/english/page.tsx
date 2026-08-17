import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { Pager } from "@/components/archive/Pager";
import { SectionHeader } from "@/components/archive/SectionHeader";
import EnglishPracticeCard from "@/components/archive/EnglishPracticeCard";
import { formatDate, getEnglishLive, liveSource, paginate } from "@/lib/data/live";
import { ENGLISH_BRIEFS } from "@/lib/data/english.briefs";
import { ENGLISH_PRACTICE_MODULES, PRACTICE_WORKFLOWS } from "@/lib/data/english.practice";

export const metadata = { title: "商务英语 · WORK / Archive" };
export const dynamic = "force-dynamic";

function excerpt(text: string, max = 180): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > max ? `${normalized.slice(0, max)}…` : normalized;
}

export default async function EnglishPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawPage = typeof sp.p === "string" ? sp.p : "1";
  const page = Math.max(1, parseInt(rawPage, 10) || 1);
  const practiceTotal = ENGLISH_PRACTICE_MODULES.reduce((sum, module) => sum + module.phrases.length, 0);
  const practicePool = ENGLISH_PRACTICE_MODULES.flatMap((module) =>
    module.phrases.map((item) => ({ moduleTitle: module.title, item })),
  );
  const dayOfMonth = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    day: "numeric",
  }).format(new Date()));
  const practiceOffset = practicePool.length ? ((dayOfMonth - 1) * 3) % practicePool.length : 0;
  const todayPractice = practicePool.length
    ? Array.from({ length: Math.min(3, practicePool.length) }, (_, index) =>
        practicePool[(practiceOffset + index) % practicePool.length],
      )
    : [];

  // 新闻语料是可选层；即使实时抓取暂时超时，固定学习内容也必须可用。
  let liveError = false;
  let pageRes = paginate<Awaited<ReturnType<typeof getEnglishLive>>[number]>([], page, 12);
  try {
    pageRes = paginate(await getEnglishLive(), page, 12);
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
          现在的学习库按工作场景组织，共 {practiceTotal} 条表达；每条都有中文含义、使用场景、例句和语气提醒，
          不需要跳转外网。
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

      <SectionHeader eyebrow="Practice First" title={`职场英语学习库 · ${practiceTotal} 条`} />
      <p className="en-sub-note">
        这些是跨国公司、科技公司、消费品牌和咨询团队常见的工作表达，不是某一家公司的内部黑话；先从今天的 3 句开始，再按场景完整练习。
      </p>
      <section className="en-daily-practice">
        <div className="en-daily-head">
          <div>
            <span className="en-daily-kicker">TODAY&apos;S PRACTICE</span>
            <h2>今天先练 3 句</h2>
          </div>
          <span className="en-daily-note">复制后直接放进会议、邮件或笔记里</span>
        </div>
        <div className="en-daily-grid">
          {todayPractice.map(({ moduleTitle, item }) => (
            <EnglishPracticeCard key={item.id} moduleTitle={moduleTitle} item={item} compact />
          ))}
        </div>
      </section>
      <div className="en-module-grid" style={{ marginTop: 12 }}>
        {ENGLISH_PRACTICE_MODULES.map((module) => (
          <a className="en-module-card" key={module.id} href={`#practice-${module.id}`}>
            <div className="en-module-card-top">
              <span className="en-module-count">{module.phrases.length} 条</span>
              <span className="en-module-arrow">↓</span>
            </div>
            <h3>{module.title}</h3>
            <div className="en-module-subtitle">{module.subtitle}</div>
            <p>{module.description}</p>
          </a>
        ))}
      </div>

      <div className="en-module-list">
        {ENGLISH_PRACTICE_MODULES.map((module, index) => (
          <details id={`practice-${module.id}`} className="en-module" key={module.id} open={index === 0}>
            <summary>
              <span>
                <b>{module.title}</b>
                <small>{module.subtitle}</small>
              </span>
              <em>{module.phrases.length} 条表达</em>
            </summary>
            {PRACTICE_WORKFLOWS[module.id]?.length ? (
              <div className="en-workflow">
                <span className="en-workflow-label">实战路线</span>
                <ol>
                  {PRACTICE_WORKFLOWS[module.id].map((step) => <li key={step}>{step}</li>)}
                </ol>
              </div>
            ) : null}
            <div className="en-phrase-grid">
              {module.phrases.map((item) => (
                <EnglishPracticeCard key={item.id} moduleTitle={module.title} item={item} />
              ))}
            </div>
          </details>
        ))}
      </div>

      <SectionHeader eyebrow="Curated Vocabulary" title="营销与面试词卡 · 进阶阅读" />
      <details className="en-advanced-details">
        <summary>展开 {ENGLISH_BRIEFS.length} 张系统化词卡</summary>
        <p className="en-sub-note">固定内容，不随每日新闻刷新而替换；适合需要深入准备营销、品牌和面试表达时使用。</p>
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
      </details>

      <SectionHeader eyebrow="Optional Live Corpus" title="行业原句库 · 可选阅读" />
      <p className="en-sub-note">
        这里仅展示真实行业文章的短摘要，用来观察表达语境；不会把整篇新闻塞进卡片，“读原文”也只是可选。
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
                  <div className="en-sentence en-sentence-compact" title={e.sentence}>
                    “{excerpt(e.sentence)}”
                  </div>
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
