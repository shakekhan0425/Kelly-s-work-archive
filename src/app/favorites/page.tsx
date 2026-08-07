import { ArchiveShell } from "@/components/archive/ArchiveShell";
import FavoritesBoard, { type FavEntry } from "@/components/archive/FavoritesBoard";
import { getSignalsLive, getCasesLive, getPodcastsLive } from "@/lib/data/live";

export const metadata = { title: "我的收藏 · WORK / Archive" };
export const dynamic = "force-dynamic";

/**
 * 收藏页。
 * 服务端只提供「id → 条目摘要」的索引；实际收藏名单存在浏览器 localStorage，
 * 由客户端组件筛选，因此无需账户即可用，且离线可读（Service Worker 已缓存收藏正文）。
 */
export default async function FavoritesPage() {
  const [signals, cases, podcasts] = await Promise.all([
    getSignalsLive(),
    getCasesLive(),
    getPodcastsLive(),
  ]);

  const index: FavEntry[] = [
    ...signals.map((s) => ({
      id: s.id,
      title: s.title,
      summary: s.summary ?? "",
      source: s.sourceName,
      date: s.publishedAt ?? "",
      kind: "signal" as const,
      href: `/signals/${s.id}`,
    })),
    ...cases.map((c) => ({
      id: c.id,
      title: c.title,
      summary: c.summary ?? "",
      source: c.sourceName,
      date: c.publishedAt ?? "",
      kind: "case" as const,
      href: `/cases/${c.id}`,
    })),
    ...podcasts.map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary ?? "",
      source: p.show || p.sourceName || "",
      date: p.publishedAt ?? "",
      kind: "podcast" as const,
      href: `/podcasts/${p.id}`,
    })),
  ];

  return (
    <ArchiveShell>
      <FavoritesBoard index={index} />
    </ArchiveShell>
  );
}
