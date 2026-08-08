import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import ArticleBody from "@/components/archive/ArticleBody";
import { ItemBrief } from "@/components/archive/ItemRow";
import NotesPanel from "@/components/archive/NotesPanel";
import FavoriteButton from "@/components/archive/FavoriteButton";
import { ReadingTracker } from "@/components/archive/ReadingTracker";
import { BackButton } from "@/components/archive/BackButton";
import ImageWithFallback from "@/components/archive/ImageWithFallback";
import {
  getItemByIdLive,
  getRelated,
  getRelatedCompanies,
  getRelatedCases,
  getRelatedPodcasts,
  getRelatedSources,
  getRelatedEnglish,
  buildKnowledgeCard,
  buildBusinessEnglish,
  buildContext,
  formatDate,
} from "@/lib/data/live";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemByIdLive(id);
  return { title: item ? `${item.title} · WORK / Archive` : "情报详情" };
}

export default async function SignalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemByIdLive(id);
  if (!item) notFound();

  const card = buildKnowledgeCard(item);
  const related = getRelated(item, 5);
  const oi = card.originalIntel;
  const companies = getRelatedCompanies(item);
  const cases = getRelatedCases(item, 4);
  const podcasts = getRelatedPodcasts(item, 3);
  const sources = getRelatedSources(item, 6);
  const english = getRelatedEnglish(item, 2);
  const biz = buildBusinessEnglish(item);
  const context = buildContext(item);

  return (
    <ArchiveShell>
      <ReadingTracker id={item.id} title={item.title} href={`/signals/${item.id}`} />
      <article className="read-wrap">
        {/* 返回 */}
        <div className="read-back">
          <BackButton fallbackHref="/signals" fallbackLabel="Market Intelligence" />
        </div>

        {/* Header */}
        <header className="read-head">
          <div className="read-kicker">
            <Link href="/signals" className="crumb">
              Market Intelligence
            </Link>
            <span className="sep">/</span>
            <span>{item.sourceName}</span>
          </div>
          <h1 className={`read-title ${item.lang === "en" ? "is-en" : ""}`}>{item.title}</h1>
          {item.summary ? <p className="read-standfirst">{item.summary}</p> : null}
          <div className="read-meta">
            {item.byline ? <span>{item.byline}</span> : null}
            {item.publishedAt ? (
              <>
                <span className="sep">·</span>
                <span>{formatDate(item.publishedAt)}</span>
              </>
            ) : null}
            {!item.thin ? (
              <>
                <span className="sep">·</span>
                <span>{item.readMinutes} min 阅读</span>
              </>
            ) : null}
            {item.lang === "en" ? <span className="stamp stamp-lav">EN</span> : null}
          </div>
          {item.hero ? (
            <ImageWithFallback
              src={item.hero}
              className="read-hero"
              loading="eager"
              fallback={{
                source: item.sourceName,
                category: item.category,
                date: item.publishedAt ? item.publishedAt.slice(0, 10).replace(/-/g, ".") : undefined,
              }}
            />
          ) : null}
        </header>

        {item.thin ? (
          <div className="incomplete-banner">
            <span className="stamp stamp-incomplete">档案整理中</span>
            <span>本篇暂以摘要模式呈现，完整解析待补充。可点击右侧「阅读原文」查看来源。</span>
          </div>
        ) : null}

        {/* 双栏：正文 + 侧栏 */}
        <div className="read-grid">
          <div>
            {/* 事件背景（由真实数据规则派生） */}
            <section className="ki-block">
              <div className="ki-head">
                <span className="ki-tag">事件背景</span>
                <span className="ki-note">基于真实抓取数据整理</span>
              </div>
              <p className="ki-event">{context}</p>
            </section>

            {/* 原始情报（由真实数据客观派生） */}
            <section className="ki-block">
              <div className="ki-head">
                <span className="ki-tag">Original Intelligence</span>
                <span className="ki-note">基于真实抓取数据整理</span>
              </div>
              {oi.event ? <p className="ki-event">{oi.event}</p> : null}
              {oi.keyFacts.length > 0 ? (
                <ul className="ki-facts">
                  {oi.keyFacts.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              ) : null}
              {oi.coreViewpoints.length > 0 ? (
                <div className="ki-views">
                  {oi.coreViewpoints.map((v, i) => (
                    <p key={i} className="ki-view">
                      {v}
                    </p>
                  ))}
                </div>
              ) : null}
              {oi.brands.length > 0 ? (
                <div className="ki-brands">
                  <span className="ki-label">涉及品牌</span>
                  {oi.brands.map((b) => (
                    <span key={b} className="stamp stamp-coral">
                      {b}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            {/* 正文（编辑感排版） */}
            <ArticleBody blocks={item.blocks} lang={item.lang} />

            {/* 行业影响 / 营销启示（规则派生） */}
            <section className="ki-block draft">
              <div className="ki-head">
                <span className="ki-tag">Industry Analysis</span>
                <span className="ki-note draft">规则派生 · 可核对</span>
              </div>
              {card.industryAnalysis?.whyImportant ? (
                <p className="ki-draft-text">{card.industryAnalysis.whyImportant}</p>
              ) : null}
              {card.industryAnalysis?.impact.market ? (
                <p className="ki-draft-text">· {card.industryAnalysis.impact.market}</p>
              ) : null}
              {card.industryAnalysis?.impact.consumer ? (
                <p className="ki-draft-text">· {card.industryAnalysis.impact.consumer}</p>
              ) : null}
              {card.industryAnalysis?.impact.brand ? (
                <p className="ki-draft-text">· {card.industryAnalysis.impact.brand}</p>
              ) : null}
              {card.industryAnalysis?.impact.channel ? (
                <p className="ki-draft-text">· {card.industryAnalysis.impact.channel}</p>
              ) : null}
            </section>
            <section className="ki-block draft">
              <div className="ki-head">
                <span className="ki-tag">Marketing Insight</span>
                <span className="ki-note draft">规则派生 · 可核对</span>
              </div>
              {card.marketingInsight?.takeaways.map((t, i) => (
                <p key={i} className="ki-draft-text">
                  · {t}
                </p>
              ))}
            </section>
            <section className="ki-block draft">
              <div className="ki-head">
                <span className="ki-tag">Career Usage</span>
                <span className="ki-note draft">规则派生 · 可核对</span>
              </div>
              {card.careerUsage?.interviewPitch ? (
                <p className="ki-draft-text">{card.careerUsage.interviewPitch}</p>
              ) : null}
              {card.careerUsage?.englishExpression ? (
                <p className="ki-draft-text">{card.careerUsage.englishExpression}</p>
              ) : null}
            </section>

            {/* 关联公司 */}
            {companies.length > 0 ? (
              <section className="ki-block">
                <div className="ki-head">
                  <span className="ki-tag">关联公司</span>
                  <span className="ki-note">由品牌 / 正文匹配真实 dossier</span>
                </div>
                <div className="rel-grid">
                  {companies.map((c) => (
                    <Link key={c.id} href={`/companies/${c.id}`} className="rel-card">
                      <div className="rel-name">{c.name}</div>
                      <div className="rel-sub">{c.category} · {c.overview.slice(0, 48)}…</div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* 关联案例 */}
            {cases.length > 0 ? (
              <section className="ki-block">
                <div className="ki-head">
                  <span className="ki-tag">关联案例</span>
                  <span className="ki-note">同话题 / 同品牌</span>
                </div>
                <div className="aside-related">
                  {cases.map((c) => (
                    <ItemBrief key={c.id} item={c} />
                  ))}
                </div>
              </section>
            ) : null}

            {/* 关联播客 */}
            {podcasts.length > 0 ? (
              <section className="ki-block">
                <div className="ki-head">
                  <span className="ki-tag">关联播客</span>
                  <span className="ki-note">真实 RSS 单集</span>
                </div>
                <div className="rel-grid">
                  {podcasts.map((ep) => (
                    <Link
                      key={ep.id}
                      href={`/podcasts/${ep.id}`}
                      className="rel-card"
                    >
                      <div className="rel-name">{ep.title}</div>
                      <div className="rel-sub">{ep.show} · {ep.publishedAt ? formatDate(ep.publishedAt) : ""}</div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* 延伸权威信源 */}
            {sources.length > 0 ? (
              <section className="ki-block">
                <div className="ki-head">
                  <span className="ki-tag">延伸信源</span>
                  <span className="ki-note">A / B 级权威来源 · 供深挖</span>
                </div>
                <div className="src-chips">
                  {sources.map((s) => (
                    <a
                      key={s.id}
                      className={`src-chip auth-${s.authority.toLowerCase()}`}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.name}
                      <span className="src-auth">{s.authority}</span>
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Business English（由真实正文规则派生） */}
            <section className="ki-block">
              <div className="ki-head">
                <span className="ki-tag">Business English</span>
                <span className="ki-note">提取正文真实商业词汇</span>
              </div>
              {biz.terms.length > 0 ? (
                <div className="be-terms">
                  {biz.terms.map((t) => (
                    <span key={t} className="stamp stamp-lav">
                      {t}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="ki-draft-text">本条正文未命中预设商业词表，可前往 /english 系统学习。</p>
              )}
              {biz.examples.slice(0, 3).map((ex, i) => (
                <div key={i} className="be-ex">
                  <span className="be-term">{ex.term}</span>
                  <p className="be-sent">{ex.sentence.slice(0, 180)}…</p>
                </div>
              ))}
              <Link href="/english" className="be-more">
                系统商务英语 →
              </Link>
            </section>

            {english.length > 0 ? (
              <section className="ki-block">
                <div className="ki-head">
                  <span className="ki-tag">关联 English Brief</span>
                </div>
                <div className="aside-related">
                  {english.map((e) => (
                    <Link key={e.id} href={`/english#${e.id}`} className="rel-card">
                      <div className="rel-name">{e.sourceTitle}</div>
                      <div className="rel-sub">{e.sourceName}</div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          {/* 侧栏 */}
          <aside className="read-aside">
            <div className="aside-card">
              <div className="aside-h">来源</div>
              <a className="source-link" href={item.url} target="_blank" rel="noreferrer">
                阅读原文 · {item.sourceName} ↗
              </a>
              <div className="aside-meta">
                {item.publishedAt ? <div>发布：{formatDate(item.publishedAt)}</div> : null}
                <div>类型：{item.category}</div>
                {item.topics.length > 0 ? <div>话题：{item.topics.join("、")}</div> : null}
              </div>
              <div style={{ marginTop: 12 }}>
                <FavoriteButton itemId={item.id} />
              </div>
            </div>

            {related.length > 0 ? (
              <div className="aside-card">
                <div className="aside-h">相关阅读</div>
                <div className="aside-related">
                  {related.map((r) => (
                    <ItemBrief key={r.id} item={r} />
                  ))}
                </div>
              </div>
            ) : null}

            <NotesPanel itemId={item.id} itemTitle={item.title} />
          </aside>
        </div>
      </article>
    </ArchiveShell>
  );
}
