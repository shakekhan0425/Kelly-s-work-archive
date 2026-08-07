import { BinderSidebar } from "./BinderSidebar";
import { TopUtilityBar } from "./TopUtilityBar";
import type { AppUser } from "@/lib/auth";

/**
 * Static demo user. For the public (unauthenticated) deploy every visitor is
 * shown the demo shell — Supabase auth is optional and only engaged when env
 * is configured at runtime.
 */
const DEMO_USER: AppUser = {
  id: "demo",
  email: "demo@archive.local",
  name: "演示用户",
  demo: true,
};

/**
 * Application shell: binder sidebar + utility bar + content.
 * Auth gate removed for the static export (the demo is publicly readable).
 */
export function ArchiveShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="wa-app">
      <BinderSidebar />
      <div className="wa-main">
        <TopUtilityBar user={DEMO_USER} />
        <main className="page-pad wa-page">{children}</main>
      </div>
    </div>
  );
}
