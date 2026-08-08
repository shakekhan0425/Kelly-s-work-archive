import type { ReactNode } from "react";

interface Props {
  /** Large italic mark, e.g. "Empty" or "Beta" */
  mark?: string;
  title: string;
  hint?: string;
  children?: ReactNode;
}

/** Warm, editorial empty state (master prompt §27). */
export function EmptyArchiveState({ mark = "Empty", title, hint, children }: Props) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-mark">{mark}</div>
      <div style={{ fontFamily: "var(--font-serif-cn)", fontSize: 15, color: "var(--color-ink)" }}>
        {title}
      </div>
      {hint && (
        <p style={{ margin: "6px auto 0", maxWidth: 420, fontSize: 13 }}>{hint}</p>
      )}
      {children && <div style={{ marginTop: 14 }}>{children}</div>}
    </div>
  );
}
