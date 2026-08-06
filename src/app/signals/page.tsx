import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import {
  SignalsExplorer,
  type SignalItem,
  type SignalFilterCount,
} from "@/components/archive/SignalsExplorer";
import {
  getSignalsLive,
  getVerticalsLive,
  getTopicsLive,
  verticalOf,
  paginate,
  liveSource,
} from "@/lib/data/live";
import { signalCategoryOf } from "@/lib/data/signal-categories";
import { contentScopeOf, CONTENT_SCOPE } from "@/lib/data/content-scope";
import { SIGNAL_CATEGORIES } from "@/lib/data/signal-categories";

export const metadata = { title: "市场情报 · WORK / Archive" };

export default async function SignalsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const vertical = one("v");
  const topic = one("t");
  const cat = one("c");
  const scope = one("s");
  const page = Math.max(1, parseInt(one("p") || "1", 10) || 1);

  const [signals, verticals, topics] = await Promise.all([
    getSignalsLive(),
    getVerticalsLive(),
    getTopicsLive(),
  ]);
  const all: SignalItem[] = signals.map((s) => ({ ...s, vertical: verticalOf(s) }));

  // 服务端筛选
  let list = all;
  if (vertical) list = list.filter((s) => s.vertical === vertical);
  if (topic) list = list.filter((s) => s.topics.includes(topic));
  if (cat) list = list.filter((s) => signalCategoryOf(s) === cat);
  if (scope) list = list.filter((s) => contentScopeOf(s) === scope);

  const pageRes = paginate(list, page);
  const src = liveSource();

  const catCounts: SignalFilterCount[] = SIGNAL_CATEGORIES.map((c) => ({
    id: c.id,
    zh: c.zh,
    count: all.filter((s) => signalCategoryOf(s) === c.id).length,
  }));
  const scopeCounts: SignalFilterCount[] = CONTENT_SCOPE.map((d) => ({
    id: d.id,
    label: d.label,
    en: d.en,
    count: all.filter((s) => contentScopeOf(s) === d.id).length,
  }));

  // 仅保留筛选参数用于分页（去掉 p，由 Pager 控制）
  const qsp = new URLSearchParams();
  if (vertical) qsp.set("v", vertical);
  if (topic) qsp.set("t", topic);
  if (cat) qsp.set("c", cat);
  if (scope) qsp.set("s", scope);
  const queryString = qsp.toString();

  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader
          eyebrow="Market Intelligence"
          title="市场情报"
          action={{ href: "/desk", label: "返回今日" }}
        />
        <p className="list-dek" style={{ maxWidth: "70ch" }}>
          跨 Consumer / Brand / Beauty / Luxury / Tech / Global 真实来源的结构化情报。Beauty 只是其一，
          所有模块支持跨行业扩展。点击条目进入「知识卡」详情（原始情报 + 行业 / 营销 / 职业萃取）。
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

      <SignalsExplorer
        all={pageRes.items as SignalItem[]}
        verticals={verticals}
        topics={topics}
        catCounts={catCounts}
        scopeCounts={scopeCounts}
        current={{ vertical, topic, cat, scope }}
        queryString={queryString}
        page={pageRes.page}
        pages={pageRes.pages}
      />
    </ArchiveShell>
  );
}
