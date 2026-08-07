import { ArchiveShell } from "@/components/archive/ArchiveShell";
import PortfolioBoard from "@/components/archive/PortfolioBoard";
import { getCompanyDossiers, CASE_STUDIES } from "@/lib/data/archive";

export const metadata = { title: "作品集 · WORK / Archive" };

export default function PortfolioPage() {
  const companies = getCompanyDossiers().map((d) => ({ id: d.id, name: d.name, category: d.category }));
  return (
    <ArchiveShell>
      <PortfolioBoard xhsPosts={CASE_STUDIES} companies={companies} />
    </ArchiveShell>
  );
}
