import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import { CompaniesExplorer } from "@/components/archive/CompaniesExplorer";
import { getCompanyDossiersLive, getCompanyGroups, liveSource } from "@/lib/data/live";
import type { CompanyCategory } from "@/lib/data/types";

export const metadata = { title: "公司研究 · WORK / Archive" };

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const group = typeof sp.g === "string" ? sp.g : "";

  const [dossiers, groups] = await Promise.all([
    getCompanyDossiersLive(group ? (group as CompanyCategory) : undefined),
    Promise.resolve(getCompanyGroups()),
  ]);
  const src = liveSource();

  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader
          eyebrow="Company Dossier"
          title="公司研究"
          action={{ href: "/desk", label: "返回今日" }}
        />
        <p className="list-dek" style={{ maxWidth: "72ch" }}>
          覆盖 9 大分类、约 80 家目标公司。A 类为深度档案（≥90% 字段完整），B 类为基础档案（≥60%），
          watchlist 为观察池（不进入首页推荐）。数据均为真实公开事实，缺失字段在详情页如实标注「档案未完成」。用于面试准备与公司研究。
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

      <CompaniesExplorer dossiers={dossiers} groups={groups} group={group} />
    </ArchiveShell>
  );
}
