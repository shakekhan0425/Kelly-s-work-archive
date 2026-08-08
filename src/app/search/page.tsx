import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import { SearchExplorer } from "@/components/archive/SearchExplorer";
import { getSignalsLive, getCasesLive } from "@/lib/data/live";

export const runtime = "edge";
export const metadata = { title: "全局搜索 · WORK / Archive" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().toLowerCase() : "";

  const [signals, cases] = await Promise.all([getSignalsLive(), getCasesLive()]);
  const items = [...signals, ...cases];

  const results = q
    ? items.filter((s) => {
        const hay = [
          s.title,
          s.summary,
          s.sourceName,
          s.category,
          ...s.topics,
          ...s.brands,
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      })
    : [];

  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader eyebrow="Search" title="全局搜索" />
        <form className="search-form" action="/search" method="get">
          <input
            className="search-input"
            type="search"
            name="q"
            placeholder="搜索情报、案例、品牌、公司、来源…"
            autoFocus
            defaultValue={q}
          />
          <button className="btn btn-primary" type="submit">
            搜索
          </button>
        </form>
      </section>

      <SearchExplorer results={results} q={q} />
    </ArchiveShell>
  );
}
