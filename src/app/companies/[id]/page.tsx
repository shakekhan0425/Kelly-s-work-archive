import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { BackButton } from "@/components/archive/BackButton";
import { getCompanyDossierLive, getCompanyGroups } from "@/lib/data/live";
import { ReadingTracker } from "@/components/archive/ReadingTracker";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getCompanyDossierLive(id);
  return { title: d ? `${d.name} · 公司研究` : "公司研究" };
}

const TIER_LABEL: Record<string, string> = {
  A: "A 类深度档案",
  B: "B 类基础档案",
  watchlist: "观察池",
};

export default async function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getCompanyDossierLive(id);
  if (!d) notFound();

  const groupLabel = getCompanyGroups().find((g) => g.category === d.category)?.label || d.category;

  return (
    <ArchiveShell>
      <ReadingTracker id={d.id} title={d.name} href={`/companies/${d.id}`} />
      <article className="read-wrap">
        <div className="read-back">
          <BackButton fallbackHref="/companies" fallbackLabel="Company Dossier" />
        </div>

        <header className="read-head">
          <div className="read-kicker">
            <Link href="/companies" className="crumb">
              Company Dossier
            </Link>
            <span className="sep">/</span>
            <span>{groupLabel}</span>
            <span className={`tier ${d.tier}`} style={{ marginLeft: 8 }}>
              {TIER_LABEL[d.tier] ?? d.tier}
            </span>
          </div>
          <h1 className="read-title">{d.name}</h1>
          {d.aliases && d.aliases.length > 0 ? (
            <p className="read-aliases">{d.aliases.join(" · ")}</p>
          ) : null}
          <p className="read-standfirst">{d.overview}</p>
        </header>

        <div className="co-detail">
          <CoField k="Timeline" list={d.timeline} />
          <CoField k="商业模式" v={d.businessModel} />
          <CoField k="营收逻辑" v={d.revenueLogic} />
          <CoField k="近三年经营基线" list={d.threeYearBaseline} />
          <CoField k="业务板块占比" list={d.segmentMix} />
          <CoField k="区域分布" list={d.regionMix} />
          <CoField k="品牌组合" tags={d.brandPortfolio} />
          <CoField k="目标消费者" list={d.consumerSegments} />
          <CoField k="渠道策略" list={d.channelStrategy} />
          <CoField k="中国策略" v={d.chinaStrategy} />
          <CoField k="竞争对标" list={d.competitorBenchmark} />
          <CoField k="近期动向" list={d.recentMoves} />
          <CoField k="营销案例" list={d.marketingCases} />
          <CoField k="文化实证" list={d.cultureEvidence} />
          <CoField k="目标岗位" tags={d.targetRoles} />
          <CoField k="面试题库" list={d.interviewQuestions} />
          <CoField k="我的适配" v={d.myFit} />
          <CoField k="风险" list={d.risks} />
          <CoField k="取舍" list={d.tradeOffs} />
          <CoField k="信源" tags={d.sources} />
          <CoField k="更新日期" v={d.updatedAt} />
        </div>
      </article>
    </ArchiveShell>
  );
}

/** 单字段渲染：有值显示，无值整段隐藏（不再满屏「档案未完成」）。 */
function CoField({
  k,
  v,
  list,
  tags,
}: {
  k: string;
  v?: string;
  list?: string[];
  tags?: string[];
}) {
  const hasText = !!v?.trim();
  const hasList = !!list && list.length > 0 && list.some((m) => m?.trim?.());
  const hasTags = !!tags && tags.length > 0;
  const empty = !hasText && !hasList && !hasTags;
  if (empty) return null;
  return (
    <section className="co-section">
      <h3 className="co-h">{k}</h3>
      {hasText ? <p className="co-p">{v}</p> : null}
      {hasList ? (
        <ul className={k === "面试题库" ? "co-questions" : "co-list"}>
          {list!.filter((m) => m?.trim?.()).map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      ) : null}
      {hasTags ? (
        <div className="co-tags">
          {tags!.map((t, i) => (
            <span key={i} className="stamp">
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}
