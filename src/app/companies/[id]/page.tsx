import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { ItemBrief } from "@/components/archive/ItemRow";
import { BackButton } from "@/components/archive/BackButton";
import {
  getCompanyDossierLive,
  getItemsByIdsLive,
  getCompanyGroups,
  getRelatedPodcasts,
  formatDate,
} from "@/lib/data/live";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getCompanyDossierLive(id);
  return { title: d ? `${d.name} · 公司研究` : "公司研究" };
}

export default async function CompanyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getCompanyDossierLive(id);
  if (!d) notFound();

  const groupLabel = getCompanyGroups().find((g) => g.group === d.group)?.label || d.group;
  const signals = await getItemsByIdsLive(d.signalIds || []);
  // 用首个关联信号构造临时 item 以复用播客关联（仅取真实单集）
  const probe = signals[0];
  const podcasts = probe ? getRelatedPodcasts(probe, 3) : [];

  return (
    <ArchiveShell>
      <article className="read-wrap">
        {/* 返回 */}
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
              {d.tier === "live" ? "已关联真实信号" : "策划资料"}
            </span>
          </div>
          <h1 className="read-title">{d.name}</h1>
          <p className="read-standfirst">{d.overview}</p>
        </header>

        <div className="co-detail">
          <CoField k="Overview" v={d.overview} />
          <CoField k="Timeline" list={d.timeline} />
          <CoField k="商业模式" v={d.businessModel} />
          <CoField k="营收逻辑" v={d.revenueLogic} />
          <CoField k="品牌组合" tags={d.brandPortfolio} />
          <CoField k="目标消费者" v={d.consumers} />
          <CoField k="中国策略" v={d.chinaStrategy} />
          <CoField k="近期动向" list={d.recentMoves} />
          <CoField k="营销案例线索" list={d.marketingCases} />
          <CoField k="竞争者" tags={d.competitors} />
          <CoField k="组织文化" v={d.culture} />
          <CoField k="开放岗位" tags={d.openRoles} />
          <CoField k="面试题库" list={d.interviewQuestions} />
          <CoField k="My Fit" v={d.myFit} />
          <CoField k="信源" tags={d.sources} />
        </div>

        {podcasts.length > 0 ? (
          <section className="co-section">
            <h3 className="co-h">关联播客（真实 RSS）</h3>
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

        {signals.length > 0 ? (
          <section className="co-section">
            <h3 className="co-h">关联真实信号（{signals.length}）</h3>
            <div className="aside-related">
              {signals.map((s) => (
                <ItemBrief key={s.id} item={s} />
              ))}
            </div>
          </section>
        ) : null}
      </article>
    </ArchiveShell>
  );
}

/** §2.7 单字段渲染：有值显示，无值标注「档案未完成」（绝不编造） */
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
  const hasList = !!list && list.length > 0;
  const hasTags = !!tags && tags.length > 0;
  const empty = !hasText && !hasList && !hasTags;
  return (
    <section className="co-section">
      <h3 className="co-h">
        {k}
        {empty ? <span className="stamp stamp-incomplete co-stamp">档案未完成</span> : null}
      </h3>
      {hasText ? <p className="co-p">{v}</p> : null}
      {hasList ? (
        <ul className={k === "面试题库" ? "co-questions" : "co-list"}>
          {list!.map((m, i) => (
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
