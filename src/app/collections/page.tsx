import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";

export const metadata = { title: "收藏集 · WORK / Archive" };

/** 起始收藏集：将真实档案按主题聚合，作为收藏入口（收藏功能后续接 localStorage / Supabase）。 */
const COLLECTIONS = [
  { name: "财报与增长", desc: "上市公司业绩、增长打法与渠道变化。", href: "/signals?t=财报增长" },
  { name: "美妆成分与创新", desc: "护肤成分、皮肤科学与新品动态。", href: "/signals?v=beauty" },
  { name: "奢侈与时尚", desc: "奢侈品战略、时尚商业与高端消费。", href: "/signals?v=luxury" },
  { name: "AI 与营销科技", desc: "生成式 AI、数据与营销自动化。", href: "/signals?v=tech" },
  { name: "社媒与内容", desc: "短视频、种草与内容营销实操。", href: "/signals?v=brand" },
  { name: "全球品牌案例", desc: "跨行业真实营销案例复盘。", href: "/cases" },
];

export default function CollectionsPage() {
  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader eyebrow="Collections" title="收藏集" action={{ href: "/desk", label: "返回今日" }} />
        <p className="list-dek" style={{ maxWidth: "72ch" }}>
          主题式收藏入口，聚合真实档案。点击进入对应筛选视图；手动收藏功能将在接入账户后开放。
        </p>
      </section>

      <div className="co-grid">
        {COLLECTIONS.map((c) => (
          <Link key={c.name} href={c.href} className="co-card">
            <span className="co-name" style={{ fontSize: 18 }}>
              {c.name}
            </span>
            <p className="co-overview">{c.desc}</p>
            <span className="tool-cta">进入 →</span>
          </Link>
        ))}
      </div>
    </ArchiveShell>
  );
}
