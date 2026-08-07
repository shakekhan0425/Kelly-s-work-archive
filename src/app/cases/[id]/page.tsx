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
  getRelatedPodcasts,
  getRelatedSources,
  buildKnowledgeCard,
  buildBusinessEnglish,
  buildContext,
  formatDate,
  getCaseStudyLive,
} from "@/lib/data/live";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemByIdLive(id);
  return { title: item ? `${item.title} · WORK / Archive` : "案例详情" };
}

export default async function CaseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getItemByIdLive(id);
  if (!item) notFound();

  const card = buildKnowledgeCard(item);
  const cs = getCaseStudyLive(item.id);
  const related = getRelated(item, 5);
  const oi = card.originalIntel;
  const companies = getRelatedCompanies(item);
  const podcasts = getRelatedPodcasts(item, 3);
  const sources = getRelatedSources(item, 6);
  const biz = buildBusinessEnglish(item);
  const context = buildContext(item);

  return (
    <ArchiveShell>
      <ReadingTracker id={item.id} title={item.title} href={`/cases/${item.id}`} />
      <article className="read-wrap">
        {/* 返回 */}
        <div className="read-back">
          <BackButton fallbackHref="/cases" fallbackLabel="Brand Casebook" />
        </div>

        <header className="read-head">
          <div className="read-kicker">
            <Link href="/cases" className="crumb">
              Brand Casebook
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

        <div className="read-grid">
          <div>
            {/* 背景 */}
            <section className="ki-block">
              <div className="ki-head">
                <span className="ki-tag">背景</span>
                <span className="ki-note">基于真实抓取数据整理</span>
              </div>
              <p className="ki-event">{context}</p>
            </section>

            {/* 案例结构化（Challenge → Learning） */}
            <section className="ki-block">
              <div className="ki-head">
                <span className="ki-tag">Case Intelligence</span>
                <span className="ki-note">基于真实正文拆解</span>
              </div>
              {oi.event ? <p className="ki-event">{oi.event}</p> : null}
              {oi.keyFacts.length > 0 ? (
                <ul className="ki-facts">
                  {oi.keyFacts.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
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

            <ArticleBody blocks={item.blocks} lang={item.lang} />

            {/* §2.6 Case Study Breakdown — Tier A 深度富化层；无 curated 数据则标注「待研究」 */}
            <section className="ki-block">
              <div className="ki-head">
                <span className="ki-tag">Case Study Breakdown</span>
                {cs ? (
                  <span className="ki-note">
                    Tier {cs.tier} 已深拆 · 证据等级 {cs.evidenceGrade} · 置信度 {Math.round(cs.confidence * 100)}%
                  </span>
                ) : (
                  <span className="ki-note stamp-incomplete">待研究 · 尚未深拆</span>
                )}
              </div>
              <div className="cb-grid">
                <CaseField k="Business Context" v={cs?.businessContext} />
                <CaseField k="Strategic Objective" v={cs?.strategicObjective} />
                <CaseField k="Challenge" v={cs?.challenge} />
                <CaseField k="Data Baseline" v={cs ? cs.dataBaseline.join("；") : undefined} />
                <CaseField k="Consumer Insight" v={cs?.consumerInsight} />
                <CaseField k="Big Idea" v={cs?.bigIdea} />
                <CaseField k="Message Architecture" v={cs ? cs.messageArchitecture.join("；") : undefined} />
                <CaseField k="Execution Timeline" v={cs ? cs.executionTimeline.join("；") : undefined} />
                <CaseField
                  k="Channel Roles"
                  v={cs ? cs.channelRoles.map((c) => `${c.channel}：${c.role}`).join("；") : undefined}
                />
                <CaseField k="Creative Assets" v={cs ? cs.creativeAssets.join("；") : undefined} />
                <CaseField k="Media Mechanism" v={cs?.mediaMechanism} />
                <CaseField k="Conversion Path" v={cs?.conversionPath} />
                <CaseField k="Results" v={cs ? cs.results.join("；") : undefined} />
                <CaseField k="What Worked" v={cs ? cs.whatWorked.join("；") : undefined} />
                <CaseField k="Limitations" v={cs ? cs.limitations.join("；") : undefined} />
                <CaseField k="Trade-offs" v={cs ? cs.tradeOffs.join("；") : undefined} />
                <CaseField k="Reusable Learning" v={cs ? cs.reusableLearning.join("；") : undefined} />
                <CaseField k="Evidence" href={item.url} hrefLabel={`阅读原文 · ${item.sourceName}`} />
                <CaseField
                  k="Related Articles"
                  items={related.map((r) => ({ id: r.id, title: r.title }))}
                />
              </div>
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

            {/* 关联播客 */}
            {podcasts.length > 0 ? (
              <section className="ki-block">
                <div className="ki-head">
                  <span className="ki-tag">关联播客</span>
                  <span className="ki-note">真实 RSS 单集</span>
                </div>
                <div className="rel-grid">
                  {podcasts.map((ep) => (
                    <Link key={ep.id} href={`/podcasts/${ep.id}`} className="rel-card">
                      <div className="rel-name">{ep.title}</div>
                      <div className="rel-sub">{ep.show} · {ep.publishedAt ? formatDate(ep.publishedAt) : ""}</div>
                    </Link>
                  ))}
                </div>
              </section>
            ) : null}

            {/* 延伸信源 */}
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

            {/* Business English */}
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

/** §2.6 单字段渲染：有值显示，无值隐藏。 */
function CaseField({
  k,
  v,
  draft,
  href,
  hrefLabel,
  items,
}: {
  k: string;
  v?: string;
  draft?: boolean;
  href?: string;
  hrefLabel?: string;
  items?: { id: string; title: string }[];
}) {
  const empty = !v?.trim() && !href && !(items && items.length > 0);
  if (empty) return null;
  return (
    <div className="cb-row">
      <span className="cb-k">{k}</span>
      {href ? (
        <a className="cb-v cb-link" href={href} target="_blank" rel="noreferrer">
          {hrefLabel || href}
        </a>
      ) : items && items.length > 0 ? (
        <div className="cb-v cb-related">
          {items.map((it) => (
            <Link key={it.id} href={`/cases/${it.id}`} className="cb-rel">
              {it.title}
            </Link>
          ))}
        </div>
      ) : (
        <p className={`cb-v ${draft ? 'draft' : ''}`}>{v}</p>
      )}
    </div>
  );
}
