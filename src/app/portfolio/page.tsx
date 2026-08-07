import { ArchiveShell } from "@/components/archive/ArchiveShell";
import PortfolioBoard from "@/components/archive/PortfolioBoard";
import { getCases, getCompanyDossiers, CASE_STUDIES } from "@/lib/data/archive";

export const metadata = { title: "作品集 · WORK / Archive" };

export default function PortfolioPage() {
  const cases = [
    ...getCases().map((c) => ({ id: c.id, title: c.title, brands: c.brands, topics: c.topics, url: c.url })),
    ...CASE_STUDIES.map((c) => ({
      id: c.id,
      title: c.campaignName,
      brands: [c.brand, ...(c.relatedCompanies ?? [])],
      topics: [] as string[],
      url: "",
    })),
  ];
  const companies = getCompanyDossiers().map((d) => ({ id: d.id, name: d.name, category: d.category }));
  return (
    <ArchiveShell>
      <PortfolioBoard cases={cases} companies={companies} />
    </ArchiveShell>
  );
}
