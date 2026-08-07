"use client";

import Link from "next/link";
import { ScrollKeeper } from "@/components/archive/ScrollKeeper";
import { saveReturnContext } from "@/lib/navigation";
import type { CompanyDossier } from "@/lib/data/types";

export interface CompanyCategoryInfo {
  category: string;
  label: string;
  count: number;
  tierA: number;
}

const TIER_LABEL: Record<string, string> = {
  A: "A 类",
  B: "B 类",
  watchlist: "观察",
};

export function CompaniesExplorer({
  dossiers,
  groups,
  group,
}: {
  dossiers: CompanyDossier[];
  groups: CompanyCategoryInfo[];
  group: string;
}) {
  const filtered = group ? dossiers.filter((d) => d.category === group) : dossiers;

  return (
    <>
      <ScrollKeeper route="/companies" />

      <div className="filter-bar">
        <Link
          href="/companies"
          className={`filter-chip ${!group ? "is-on" : ""}`}
        >
          全部 {dossiers.length}
        </Link>
        {groups.map((g) => (
          <Link
            key={g.category}
            href={`/companies?g=${g.category}`}
            className={`filter-chip ${group === g.category ? "is-on" : ""}`}
          >
            {g.label} <span className="fc-n">{g.count}</span>
          </Link>
        ))}
      </div>

      <div className="co-grid" style={{ marginTop: 18 }}>
        {filtered.map((d) => (
          <Link
            key={d.id}
            href={`/companies/${d.id}`}
            className="co-card"
            onClick={() =>
              saveReturnContext({
                fromRoute: "/companies",
                fromLabel: "Company Dossier",
                fromTab: group || undefined,
                fromFilters: { g: group },
                scrollY: typeof window !== "undefined" ? window.scrollY : 0,
              })
            }
          >
            <div className="co-top">
              <span className="co-name">{d.name}</span>
              <span className={`tier ${d.tier}`}>
                {TIER_LABEL[d.tier] ?? d.tier}
              </span>
            </div>
            <div className="co-group">
              {groups.find((g) => g.category === d.category)?.label || d.category}
            </div>
            <p className="co-overview">{d.overview}</p>
            <div className="co-foot">
              {d.targetRoles.length ? (
                <span className="co-roles">
                  {d.targetRoles.slice(0, 2).join(" · ")}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
