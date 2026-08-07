import { ArchiveShell } from "@/components/archive/ArchiveShell";
import StudioBoard from "@/components/archive/StudioBoard";
import { getAllItems, getCases, getCompanyDossiers, getVerticals, verticalOf, CASE_STUDIES } from "@/lib/data/archive";

export const metadata = { title: "创意工作室 · WORK / Archive" };

export default function StudioPage() {
  const verticals = getVerticals();
  const signals = getAllItems()
    .filter((s) => !s.thin)
    .map((s) => ({
      id: s.id,
      title: s.title,
      sourceName: s.sourceName,
      vertical: verticalOf(s),
      topics: s.topics,
      brands: s.brands,
      summary: s.summary,
      url: s.url,
    }));
  const cases = [
    ...getCases().map((c) => ({
      id: c.id,
      title: c.title,
      sourceName: c.sourceName,
      brands: c.brands,
      topics: c.topics,
      summary: c.summary,
      url: c.url,
    })),
    ...CASE_STUDIES.map((c) => ({
      id: c.id,
      title: c.campaignName,
      sourceName: "品牌案例库",
      brands: [c.brand, ...(c.relatedCompanies ?? [])],
      topics: [] as string[],
      summary: c.businessContext ?? "",
      url: "",
    })),
  ];
  const companies = getCompanyDossiers().map((d) => ({ id: d.id, name: d.name, category: d.category }));

  return (
    <ArchiveShell>
      <StudioBoard
        verticals={verticals.map((v) => ({ id: v.id, label: v.label }))}
        signals={signals}
        cases={cases}
        companies={companies}
      />
    </ArchiveShell>
  );
}
