import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import { getArchive, getCompanyDossiers, getSourceIntel } from "@/lib/data/archive";

export const metadata = { title: "档案库 · WORK / Archive" };

export default function LibraryPage() {
  const stats = getArchive().stats;
  const companies = getCompanyDossiers().length;
  const liveSources = getSourceIntel().filter((s) => s.live).length;

  const tiles = [
    { href: "/signals", label: "市场情报", n: stats.signals, en: "Market Intelligence" },
    { href: "/cases", label: "品牌案例", n: stats.cases, en: "Brand Casebook" },
    { href: "/companies", label: "公司研究", n: companies, en: "Company Dossier" },
    { href: "/podcasts", label: "播客单集", n: stats.podcasts, en: "Podcast" },
    { href: "/english", label: "商务英语", n: stats.english, en: "Business English" },
    { href: "/sources", label: "来源体系", n: `${liveSources}/${stats.sources}`, en: "Sources" },
  ];

  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader eyebrow="Library" title="档案库" action={{ href: "/desk", label: "返回今日" }} />
        <p className="list-dek" style={{ maxWidth: "72ch" }}>
          全部真实抓取内容的汇总入口。点击任意模块进入对应档案。
        </p>
      </section>

      <div className="grid-stats">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="stat-tile" style={{ textDecoration: "none" }}>
            <span className="num">{t.n}</span>
            <span className="lbl">{t.label}</span>
            <span className="lbl-en">{t.en}</span>
          </Link>
        ))}
      </div>
    </ArchiveShell>
  );
}
