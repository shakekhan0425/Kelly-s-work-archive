import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import BriefBuilder from "@/components/archive/BriefBuilder";
import { getSourceIntel, getArchive, getCompanyDossiers } from "@/lib/data/archive";
import { getToolkitByCategory } from "@/lib/data/frameworks";

export const metadata = { title: "营销工具箱 · WORK / Archive" };

const CATS: { cat: 'Framework' | 'Template' | 'Prompt' | 'Research'; eyebrow: string; title: string }[] = [
  { cat: 'Framework', eyebrow: 'Framework Library', title: '框架库' },
  { cat: 'Template', eyebrow: 'Template Library', title: '模版库' },
  { cat: 'Prompt', eyebrow: 'Prompt Library', title: '提示词库' },
  { cat: 'Research', eyebrow: 'Research Guide', title: '研究指南' },
];

export default function ToolsPage() {
  const liveSources = getSourceIntel().filter((s) => s.live).length;
  const totalSources = getSourceIntel().length;
  const stats = getArchive().stats;
  const companies = getCompanyDossiers().length;

  const tools = [
    {
      name: "Source Tracker",
      tag: "实时",
      desc: "追踪已接入的真实来源与抓取状态。",
      href: "/sources",
      cta: "查看来源体系",
    },
    {
      name: "Case Analyzer",
      tag: "真实案例",
      desc: "基于品牌案例库检索与拆解。",
      href: "/cases",
      cta: "打开案例库",
    },
    {
      name: "Business English",
      tag: "语料",
      desc: "真实文章提取的营销 / 商业句型。",
      href: "/english",
      cta: "进入英语库",
    },
    {
      name: "Podcast Digest",
      tag: "音频",
      desc: "播客单集摘要与商业启示。",
      href: "/podcasts",
      cta: "浏览播客",
    },
    {
      name: "Visual Inspiration",
      tag: "审美",
      desc: "品牌视觉与排版灵感积累。",
      href: "/visuals",
      cta: "视觉素材库",
    },
    {
      name: "Career Asset Progress",
      tag: "进度",
      desc: `已读情报 ${stats.signals} · 研究公司 ${companies} · 案例 ${stats.cases} · 播客 ${stats.podcasts}`,
      href: "/portfolio",
      cta: "职业资产",
    },
  ];

  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader
          eyebrow="Marketing Toolkit"
          title="营销工具箱"
          action={{ href: "/desk", label: "返回今日" }}
        />
        <p className="list-dek" style={{ maxWidth: "72ch" }}>
          每个工具都接入真实数据或提供可用功能，而非空壳。已接入 {liveSources}/{totalSources} 个真实来源。
        </p>
      </section>

      {/* 可交互工具 */}
      <BriefBuilder />

      {/* 工具卡片网格 */}
      <div className="tool-grid" style={{ marginTop: 18, marginBottom: 26 }}>
        {tools.map((t) => (
          <Link key={t.name} href={t.href} className="tool-card">
            <div className="tool-h">
              <span className="tool-name">{t.name}</span>
              <span className="tool-tag">{t.tag}</span>
            </div>
            <p className="tool-desc">{t.desc}</p>
            <span className="tool-cta">{t.cta} →</span>
          </Link>
        ))}
      </div>

      {/* 四大知识库：Framework / Template / Prompt / Research */}
      {CATS.map(({ cat, eyebrow, title }) => {
        const items = getToolkitByCategory(cat);
        return (
          <section key={cat} style={{ marginBottom: 26 }}>
            <SectionHeader eyebrow={eyebrow} title={title} />
            <div className="fw-grid">
              {items.map((it) => (
                <div key={it.id} className="fw-card">
                  <div className="fw-name">{it.name}</div>
                  <p className="fw-sum">{it.summary}</p>
                  <ul className="fw-points">
                    {it.points.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                  <div className="fw-use">
                    <span className="fw-use-k">适用</span>
                    {it.useWhen}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </ArchiveShell>
  );
}
