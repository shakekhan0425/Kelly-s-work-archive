import { ArchiveShell } from "@/components/archive/ArchiveShell";
import {
  VisualsExplorer,
  type VizItem,
  type VizVert,
} from "@/components/archive/VisualsExplorer";
import { getSignalsLive, getCasesLive, getVerticalsLive, liveSource } from "@/lib/data/live";
import { verticalOf } from "@/lib/data/archive";

export const runtime = "edge";
export const metadata = { title: "视觉素材库 · WORK / Archive" };

export default async function VisualsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const v = typeof sp.v === "string" ? sp.v : "";
  const src = typeof sp.src === "string" ? sp.src : "";

  const [signals, cases, verticals] = await Promise.all([
    getSignalsLive(),
    getCasesLive(),
    getVerticalsLive(),
  ]);

  const items: VizItem[] = [
    ...signals.map((s) => ({
      id: s.id,
      kind: "signal" as const,
      title: s.title,
      hero: s.hero,
      sourceName: s.sourceName,
      vertical: verticalOf(s),
      url: s.url,
    })),
    ...cases.map((c) => ({
      id: c.id,
      kind: "case" as const,
      title: c.title,
      hero: c.hero,
      sourceName: c.sourceName,
      vertical: verticalOf(c),
      url: c.url,
    })),
  ].filter((it) => !!it.hero);

  const filtered = items.filter((it) => {
    if (v && it.vertical !== v) return false;
    if (src && !it.sourceName.includes(src)) return false;
    return true;
  });

  const vizVerticals: VizVert[] = verticals.map((vt) => ({
    id: vt.id,
    label: vt.label,
    zh: vt.zh,
  }));
  const sources = Array.from(new Set(items.map((i) => i.sourceName))).sort();

  return (
    <ArchiveShell>
      <VisualsExplorer
        items={filtered}
        total={items.length}
        verticals={vizVerticals}
        sources={sources}
        current={{ v, src }}
      />
    </ArchiveShell>
  );
}
