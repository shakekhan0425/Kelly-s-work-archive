import { ArchiveShell } from "./ArchiveShell";

/** 资讯列表骨架（row/list 模式，带缩略图占位） */
export function SignalListSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <ArchiveShell>
      <div className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <div className="skeleton skeleton-title" style={{ width: 180 }} />
        <div className="skeleton skeleton-line" style={{ width: "70%" }} />
      </div>
      <div className="filter-bar">
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className="skeleton" style={{ height: 30, width: 72, borderRadius: 999 }} />
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="list-row" style={{ borderBottom: "1px solid var(--color-line)" }}>
            <div className="skeleton skeleton-thumb" style={{ aspectRatio: "4 / 3" }} />
            <div style={{ minWidth: 0 }}>
              <div className="skeleton skeleton-line" style={{ width: "40%", height: 11 }} />
              <div className="skeleton skeleton-title" style={{ width: "82%" }} />
              <div className="skeleton skeleton-line" style={{ width: "100%" }} />
              <div className="skeleton skeleton-line" style={{ width: "64%" }} />
            </div>
          </div>
        ))}
      </div>
    </ArchiveShell>
  );
}

/** 卡片网格骨架（案例 / 公司 / 播客） */
export function CardGridSkeleton({ cards = 9 }: { cards?: number }) {
  return (
    <ArchiveShell>
      <div className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <div className="skeleton skeleton-title" style={{ width: 160 }} />
        <div className="skeleton skeleton-line" style={{ width: "60%" }} />
      </div>
      <div className="card-grid">
        {Array.from({ length: cards }, (_, i) => (
          <div key={i} className="editorial-card" style={{ display: "block" }}>
            <div className="skeleton" style={{ width: "100%", aspectRatio: "16 / 10" }} />
            <div className="skeleton skeleton-line" style={{ width: "30%", marginTop: 10, height: 10 }} />
            <div className="skeleton skeleton-title" style={{ width: "88%" }} />
            <div className="skeleton skeleton-line" style={{ width: "70%" }} />
          </div>
        ))}
      </div>
    </ArchiveShell>
  );
}

/** 详情页骨架 */
export function DetailSkeleton() {
  return (
    <ArchiveShell>
      <div className="read-hero skeleton" style={{ width: "100%", aspectRatio: "16 / 7", marginBottom: 18 }} />
      <div className="skeleton skeleton-title" style={{ width: "60%" }} />
      <div className="skeleton skeleton-line" style={{ width: "40%" }} />
      <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className="skeleton skeleton-line" style={{ width: `${100 - (i % 3) * 12}%` }} />
        ))}
      </div>
    </ArchiveShell>
  );
}

/** 通用两栏骨架（创作 / 作品集类工具页） */
export function ToolSkeleton() {
  return (
    <ArchiveShell>
      <div className="src-hero">
        <div className="skeleton skeleton-title" style={{ width: 140 }} />
        <div className="skeleton skeleton-line" style={{ width: "80%" }} />
      </div>
      <div className="tool-body">
        <div style={{ display: "grid", gap: 10 }}>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton skeleton-line" style={{ width: `${90 - (i % 4) * 10}%` }} />
          ))}
        </div>
        <div className="skeleton" style={{ width: "100%", minHeight: 240, borderRadius: 6 }} />
      </div>
    </ArchiveShell>
  );
}
