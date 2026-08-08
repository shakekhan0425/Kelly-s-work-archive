import { BinderSidebar } from "./BinderSidebar";
import { TopUtilityBar } from "./TopUtilityBar";
import type { AppUser } from "@/lib/auth";

/**
 * Default public user for the unauthenticated deploy.
 * Supabase auth is optional and engaged when env is configured at runtime.
 */
const DEFAULT_USER: AppUser = {
  id: "kelly",
  email: null,
  name: "Kelly",
  demo: false,
};

/**
 * Application shell: binder sidebar + utility bar + content.
 * Auth gate removed for the public deploy (the archive is publicly readable).
 */
export function ArchiveShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="wa-app">
      <BinderSidebar />
      <div className="wa-main">
        <TopUtilityBar user={DEFAULT_USER} />
        <main className="page-pad wa-page">{children}</main>
      </div>
    </div>
  );
}
