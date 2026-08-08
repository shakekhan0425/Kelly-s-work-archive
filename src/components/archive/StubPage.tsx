import { ArchiveShell } from "./ArchiveShell";
import { SectionHeader } from "./SectionHeader";
import { EmptyArchiveState } from "./EmptyArchiveState";

interface Props {
  eyebrow: string;
  title: string;
  /** planned phase for this surface, e.g. "Phase 1" */
  phase?: string;
  description: string;
  primaryAction?: { href: string; label: string };
}

/** Reusable placeholder for routes not built yet. */
export function StubPage({
  eyebrow,
  title,
  phase,
  description,
  primaryAction,
}: Props) {
  return (
    <ArchiveShell>
      {phase ? (
        <div style={{ marginBottom: 18 }}>
          <span className="issue-no">{phase}</span>
        </div>
      ) : null}
      <SectionHeader eyebrow={eyebrow} title={title} />
      <EmptyArchiveState
        mark=""
        title={description}
        hint="该模块已纳入产品规划，当前展示最终视觉方向。"
      >
        {primaryAction && (
          <a href={primaryAction.href} className="btn btn-primary">
            {primaryAction.label}
          </a>
        )}
      </EmptyArchiveState>
    </ArchiveShell>
  );
}
