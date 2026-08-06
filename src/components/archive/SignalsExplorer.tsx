"use client";

import Link from "next/link";
import ItemRow from "@/components/archive/ItemRow";
import { ScrollKeeper } from "@/components/archive/ScrollKeeper";
import { Pager } from "@/components/archive/Pager";
import { saveReturnContext } from "@/lib/navigation";
import type { ArchiveItem } from "@/lib/data/types";
import type { SignalCategoryId } from "@/lib/data/signal-categories";

export interface SignalVert {
  id: string;
  zh: string;
  label: string;
  count: number;
}

export interface SignalTopic {
  name: string;
  count: number;
}

export interface SignalItem extends ArchiveItem {
  vertical: string;
}

export interface SignalFilterCount {
  id: string;
  zh?: string;
  label?: string;
  en?: string;
  count: number;
}

export interface SignalCurrent {
  vertical: string;
  topic: string;
  cat: string;
  scope: string;
}

export function SignalsExplorer({
  all,
  verticals,
  topics,
  catCounts,
  scopeCounts,
  current,
  queryString,
  page,
  pages,
}: {
  all: SignalItem[];
  verticals: SignalVert[];
  topics: SignalTopic[];
  catCounts: SignalFilterCount[];
  scopeCounts: SignalFilterCount[];
  current: SignalCurrent;
  queryString: string;
  page: number;
  pages: number;
}) {
  const { vertical, topic, cat, scope } = current;

  return (
    <>
      <ScrollKeeper route="/signals" />

      <div className="filter-bar">
        <Link
          href="/signals"
          className={`filter-chip ${!vertical && !topic && !cat && !scope ? "is-on" : ""}`}
        >
          全部 {verticals.reduce((a, v) => a + v.count, 0)}
        </Link>
        {verticals.map((v) => (
          <Link
            key={v.id}
            href={`/signals?v=${v.id}`}
            className={`filter-chip ${vertical === v.id ? "is-on" : ""}`}
          >
            {v.zh} · {v.label} <span className="fc-n">{v.count}</span>
          </Link>
        ))}
      </div>

      <div className="filter-bar" style={{ marginTop: 8 }}>
        <span className="filter-label">市场分类</span>
        {catCounts.map((c) => (
          <Link
            key={c.id}
            href={`/signals?c=${c.id}`}
            className={`filter-chip sub ${cat === c.id ? "is-on" : ""}`}
          >
            {c.zh} <span className="fc-n">{c.count}</span>
          </Link>
        ))}
      </div>

      <div className="filter-bar" style={{ marginTop: 8 }}>
        <span className="filter-label">内容领域</span>
        {scopeCounts.map((d) => (
          <Link
            key={d.id}
            href={`/signals?s=${d.id}`}
            className={`filter-chip sub ${scope === d.id ? "is-on" : ""}`}
            title={d.en}
          >
            {d.label} <span className="fc-n">{d.count}</span>
          </Link>
        ))}
      </div>

      {!vertical && (
        <div className="filter-bar" style={{ marginTop: 8 }}>
          {topics.map((t) => (
            <Link
              key={t.name}
              href={`/signals?t=${encodeURIComponent(t.name)}`}
              className={`filter-chip sub ${topic === t.name ? "is-on" : ""}`}
            >
              {t.name} <span className="fc-n">{t.count}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="col-list" style={{ marginTop: 18 }}>
        {all.length > 0 ? (
          all.map((s) => (
            <ItemRow
              key={s.id}
              item={s}
              href={`/signals/${s.id}`}
              onClick={() =>
                saveReturnContext({
                  fromRoute: "/signals",
                  fromLabel: "Market Intelligence",
                  fromTab: vertical || cat || topic || scope || undefined,
                  fromFilters: { v: vertical, t: topic, c: cat, s: scope },
                  scrollY: typeof window !== "undefined" ? window.scrollY : 0,
                })
              }
            />
          ))
        ) : (
          <p className="list-dek">该筛选下暂无条目。</p>
        )}
      </div>

      <Pager basePath="/signals" queryString={queryString} page={page} pages={pages} />
    </>
  );
}
