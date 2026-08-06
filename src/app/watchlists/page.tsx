import { ArchiveShell } from "@/components/archive/ArchiveShell";
import WatchlistsBoard from "@/components/archive/WatchlistsBoard";
import { getAllItems, getCases, getCompanyDossiers, getSources } from "@/lib/data/archive";

export const metadata = { title: "观察名单 · WORK / Archive" };

export default function WatchlistsPage() {
  const signals = getAllItems().map((s) => ({ id: s.id, title: s.title }));
  const cases = getCases().map((c) => ({ id: c.id, title: c.title }));
  const companies = getCompanyDossiers().map((d) => ({ id: d.id, title: d.name }));
  const sources = getSources().map((s) => ({ id: s.id, title: s.name }));

  return (
    <ArchiveShell>
      <WatchlistsBoard signals={signals} cases={cases} companies={companies} sources={sources} />
    </ArchiveShell>
  );
}
