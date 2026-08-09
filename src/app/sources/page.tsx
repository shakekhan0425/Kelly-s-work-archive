import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { WechatSourcesPanel } from "@/components/archive/WechatSourcesPanel";
import { getSourceGroupsLive, getSourceIntelLive, liveSource } from "@/lib/data/live";
import type { SourceGroup, SourceIntel } from "@/lib/data/types";

/** 权重顺序：Marketing / Brand / Luxury / Consumer 最高，纯技术最低。 */
const GROUP_ORDER: SourceGroup[] = [
  "Marketing",
  "Luxury",
  "Beauty",
  "Business Strategy",
  "AI Business",
  "Podcast",
];

const GROUP_LABEL: Record<SourceGroup, string> = {
  Marketing: "营销 Marketing",
  Luxury: "奢侈 / 时尚 Luxury",
  Beauty: "美妆 Beauty",
  "Business Strategy": "商业战略 / 消费者研究 Strategy",
  "AI Business": "AI 商业 / 科技 AI Business",
  Podcast: "播客 Podcast",
  Casebook: "案例 Casebook",
};

const AUTHORITY_RANK: Record<string, number> = { A: 0, B: 1, C: 2 };

function accessLabel(m: string): string {
  if (m === "open") return "开放";
  if (m === "newsletter") return "邮件订阅";
  if (m === "paywall") return "付费墙";
  if (m === "login") return "登录";
  if (m === "restricted") return "受限接入";
  return m;
}

export const metadata = { title: "来源体系 · Source Intelligence" };

export default async function SourcesPage() {
  const [groups, all] = await Promise.all([getSourceGroupsLive(), getSourceIntelLive()]);
  const liveCount = all.filter((s) => s.live).length;
  const aCount = all.filter((s) => s.authority === "A").length;
  const src = liveSource();

  return (
    <ArchiveShell>
      <div className="src-wrap">
        <header className="src-hero">
          <div className="src-kicker">Source Intelligence Layer</div>
          <h1 className="src-title">来源体系</h1>
          <p className="src-lead">
            所有情报、案例与播客都来自下方经过筛选的真实来源。我们按赛道、权威度与适用岗位组织它们，
            并标注接入状态。来源是可信内容的第一道关口——AI 推荐内容优先采用 A 级与 B 级来源。
          </p>
          <div className="src-stats">
            <div>
              <b>{all.length}</b>
              <span>已收录来源</span>
            </div>
            <div>
              <b>{aCount}</b>
              <span>A 级权威</span>
            </div>
            <div>
              <b>{liveCount}</b>
              <span>已接入抓取</span>
            </div>
            <div>
              <b>{groups.length}</b>
              <span>覆盖赛道</span>
            </div>
          </div>
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
        </header>

        {GROUP_ORDER.map((g) => {
          const items = all
            .filter((s) => s.group === g)
            .sort((a, b) => AUTHORITY_RANK[a.authority] - AUTHORITY_RANK[b.authority]);
          if (items.length === 0) return null;
          const live = items.filter((s) => s.live).length;
          const aInGroup = items.filter((s) => s.authority === "A").length;
          return (
            <section className="src-group" key={g}>
              <div className="src-group-h">
                <span>{GROUP_LABEL[g]}</span>
                <em>
                  {items.length} 个 · A级 {aInGroup} · {live} 已接入
                </em>
              </div>
              <div className="src-grid">
                {items.map((s) => (
                  <SourceCard key={s.id} s={s} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <WechatSourcesPanel />
    </ArchiveShell>
  );
}

function SourceCard({ s }: { s: SourceIntel }) {
  return (
    <article className={`src-card auth-${s.authority}`}>
      <div className="src-head">
        <div>
          <div className="src-name">{s.name}</div>
          <div className="src-cat">{s.category}</div>
        </div>
        <span className="src-authority" data-a={s.authority} title="权威度">
          {s.authority}
        </span>
      </div>
      <p className="src-why">{s.whyFollow}</p>
      <div className="src-meta-row">
        <span className="src-chip">地区 {s.region}</span>
        <span className="src-chip">{accessLabel(s.accessMode)}</span>
        <span className="src-chip">
          {s.lang === "zh" ? "中文" : s.lang === "en" ? "English" : "中英"}
        </span>
        <span className="src-chip">{s.updateFrequency}</span>
      </div>
      <div className="src-tags">
        {s.paywall ? <span className="src-tag warn">付费墙</span> : null}
        {s.newsletter ? <span className="src-tag">Newsletter</span> : null}
        <span className="src-tag">{s.targetRole}</span>
      </div>
      <div className="src-foot">
        <span className={`src-status ${s.live ? "live" : "pending"}`}>
          {s.live ? `● 已接入 · ${s.itemCount ?? 0} 条` : "○ 规划中"}
        </span>
        <span className="src-links">
          <a className="src-go" href={s.url} target="_blank" rel="noreferrer">
            主页 ↗
          </a>
          {s.rss ? (
            <a className="src-go" href={s.rss} target="_blank" rel="noreferrer">
              RSS ↗
            </a>
          ) : null}
        </span>
      </div>
    </article>
  );
}
