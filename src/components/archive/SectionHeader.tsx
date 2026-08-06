import Link from "next/link";
import type { ReactNode } from "react";

interface Props {
  eyebrow: string;
  title: string;
  action?: { href: string; label: string };
  children?: ReactNode;
}

/** Editorial section header with an English eyebrow and optional action link. */
export function SectionHeader({ eyebrow, title, action, children }: Props) {
  return (
    <div className="section-title">
      <div style={{ flex: 1 }}>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="btn btn-ghost" style={{ alignSelf: "center" }}>
          {action.label} →
        </Link>
      )}
      {children}
    </div>
  );
}
