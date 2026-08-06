"use client";

import Link from "next/link";
import { ScrollKeeper } from "@/components/archive/ScrollKeeper";
import { saveReturnContext } from "@/lib/navigation";
import type { CompanyDossier } from "@/lib/data/types";

export interface CompanyGroupInfo {
  group: string;
  label: string;
  count: number;
  live?: number;
}

export function CompaniesExplorer({
  dossiers,
  groups,
  group,
}: {
  dossiers: CompanyDossier[];
  groups: CompanyGroupInfo[];
  group: string;
}) {
  const filtered = group ? dossiers.filter((d) => d.group === group) : dossiers;

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
            key={g.group}
            href={`/companies?g=${g.group}`}
            className={`filter-chip ${group === g.group ? "is-on" : ""}`}
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
                {d.tier === "live" ? "有信号" : "策划"}
              </span>
            </div>
            <div className="co-group">
              {groups.find((g) => g.group === d.group)?.label || d.group}
            </div>
            <p className="co-overview">{d.overview}</p>
            <div className="co-foot">
              {d.mentions ? (
                <span className="co-mentions">{d.mentions} 条信号</span>
              ) : null}
              {d.openRoles.length ? (
                <span className="co-roles">
                  {d.openRoles.slice(0, 2).join(" · ")}
                </span>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
