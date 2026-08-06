import { ArchiveShell } from "@/components/archive/ArchiveShell";
import PortfolioBoard from "@/components/archive/PortfolioBoard";
import { getCases, getCompanyDossiers } from "@/lib/data/archive";

export const metadata = { title: "作品集 · WORK / Archive" };

export default function PortfolioPage() {
  const cases = getCases().map((c) => ({ id: c.id, title: c.title, brands: c.brands, topics: c.topics, url: c.url }));
  const companies = getCompanyDossiers().map((d) => ({ id: d.id, name: d.name, group: d.group }));
  return (
    <ArchiveShell>
      <PortfolioBoard cases={cases} companies={companies} />
    </ArchiveShell>
  );
}
