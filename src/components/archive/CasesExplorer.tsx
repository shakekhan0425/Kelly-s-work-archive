"use client";

import Link from "next/link";
import ItemRow from "@/components/archive/ItemRow";
import { ScrollKeeper } from "@/components/archive/ScrollKeeper";
import { Pager } from "@/components/archive/Pager";
import { saveReturnContext } from "@/lib/navigation";
import type { ArchiveItem } from "@/lib/data/types";

export interface CaseTopic {
  name: string;
  count: number;
}

export interface CaseFilterCount {
  id: string;
  label: string;
  en?: string;
  count: number;
}

export interface CaseCurrent {
  topic: string;
  scope: string;
}

export function CasesExplorer({
  all,
  total,
  topics,
  scopeCounts,
  current,
  queryString,
  page,
  pages,
}: {
  all: ArchiveItem[];
  total: number;
  topics: CaseTopic[];
  scopeCounts: CaseFilterCount[];
  current: CaseCurrent;
  queryString: string;
  page: number;
  pages: number;
}) {
  const { topic, scope } = current;

  return (
    <>
      <ScrollKeeper route="/cases" />

      <div className="filter-bar">
        <Link
          href="/cases"
          className={`filter-chip ${!topic && !scope ? "is-on" : ""}`}
        >
          全部 {total}
        </Link>
        <span className="filter-label" style={{ marginLeft: 4 }}>内容领域</span>
        {scopeCounts.map((d) => (
          <Link
            key={d.id}
            href={`/cases?s=${d.id}`}
            className={`filter-chip sub ${scope === d.id ? "is-on" : ""}`}
            title={d.en}
          >
            {d.label} <span className="fc-n">{d.count}</span>
          </Link>
        ))}
      </div>

      <div className="filter-bar" style={{ marginTop: 8 }}>
        {topics.map((t) => (
          <Link
            key={t.name}
            href={`/cases?t=${encodeURIComponent(t.name)}`}
            className={`filter-chip sub ${topic === t.name ? "is-on" : ""}`}
          >
            {t.name} <span className="fc-n">{t.count}</span>
          </Link>
        ))}
      </div>

      <div className="col-list" style={{ marginTop: 18 }}>
        {all.length > 0 ? (
          all.map((s) => (
            <ItemRow
              key={s.id}
              item={s}
              href={`/cases/${s.id}`}
              onClick={() =>
                saveReturnContext({
                  fromRoute: "/cases",
                  fromLabel: "Brand Casebook",
                  fromTab: scope || topic || undefined,
                  fromFilters: { t: topic, s: scope },
                  scrollY: typeof window !== "undefined" ? window.scrollY : 0,
                })
              }
            />
          ))
        ) : (
          <p className="list-dek">该筛选下暂无条目。</p>
        )}
      </div>

      <Pager basePath="/cases" queryString={queryString} page={page} pages={pages} />
    </>
  );
}
