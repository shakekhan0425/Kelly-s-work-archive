import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import {
  CasesExplorer,
  type CaseTopic,
  type CaseFilterCount,
} from "@/components/archive/CasesExplorer";
import { getCasesLive, getTopicsLive, paginate, liveSource } from "@/lib/data/live";
import { contentScopeOf, CONTENT_SCOPE } from "@/lib/data/content-scope";

export const metadata = { title: "品牌案例库 · WORK / Archive" };
export const dynamic = "force-dynamic";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const topic = one("t");
  const scope = one("s");
  const page = Math.max(1, parseInt(one("p") || "1", 10) || 1);

  const [list, topicsRaw] = await Promise.all([getCasesLive(), getTopicsLive()]);
  const topics: CaseTopic[] = topicsRaw.slice(0, 14).map((t) => ({
    name: t.name,
    count: t.count,
  }));
  const src = liveSource();

  let filtered = list;
  if (topic) filtered = filtered.filter((s) => s.topics.includes(topic));
  if (scope) filtered = filtered.filter((s) => contentScopeOf(s) === scope);

  const pageRes = paginate(filtered, page);

  const scopeCounts: CaseFilterCount[] = CONTENT_SCOPE.map((d) => ({
    id: d.id,
    label: d.label,
    en: d.en,
    count: list.filter((s) => contentScopeOf(s) === d.id).length,
  }));

  const qsp = new URLSearchParams();
  if (topic) qsp.set("t", topic);
  if (scope) qsp.set("s", scope);
  const queryString = qsp.toString();

  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader
          eyebrow="Brand Casebook"
          title="品牌案例库"
          action={{ href: "/desk", label: "返回今日" }}
        />
        <p className="list-dek" style={{ maxWidth: "70ch" }}>
          跨行业真实营销案例（美妆 / 奢侈 / 消费科技 / 平台 / 零售）。Beauty 只是专业标签之一，
          所有模块覆盖 Consumer / Brand / Advertising / Fashion / Business / Technology 七域。
          每条案例均来自真实来源抓取，含完整结构化正文。
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

      <CasesExplorer
        all={pageRes.items}
        topics={topics}
        scopeCounts={scopeCounts}
        current={{ topic, scope }}
        queryString={queryString}
        page={pageRes.page}
        pages={pageRes.pages}
      />
    </ArchiveShell>
  );
}
