import { ArchiveShell } from "./ArchiveShell";
import { SectionHeader } from "./SectionHeader";
import { EmptyArchiveState } from "./EmptyArchiveState";

interface Props {
  eyebrow: string;
  title: string;
  /** planned phase for this surface, e.g. "Phase 1" */
  phase: string;
  description: string;
  primaryAction?: { href: string; label: string };
}

/** Reusable placeholder for routes not built in Phase 0. */
export function StubPage({
  eyebrow,
  title,
  phase,
  description,
  primaryAction,
}: Props) {
  return (
    <ArchiveShell>
      <div style={{ marginBottom: 18 }}>
        <span className="issue-no">PLANNED · {phase}</span>
      </div>
      <SectionHeader eyebrow={eyebrow} title={title} />
      <EmptyArchiveState
        mark="Soon"
        title={description}
        hint="此模块将在对应开发阶段实现，当前仅展示最终视觉方向。"
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
