import { ArchiveShell } from "@/components/archive/ArchiveShell";
import PortfolioBoard from "@/components/archive/PortfolioBoard";
import { CASE_STUDIES } from "@/lib/data/archive";

export const metadata = { title: "作品集 · WORK / Archive" };

export default function PortfolioPage() {
  return (
    <ArchiveShell>
      <PortfolioBoard xhsPosts={CASE_STUDIES} />
    </ArchiveShell>
  );
}
