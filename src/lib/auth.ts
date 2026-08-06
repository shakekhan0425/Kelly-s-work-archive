import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSupabase } from "./supabase/server";

export const DEMO_COOKIE = "wa_demo";

export interface AppUser {
  id: string;
  email: string | null;
  name: string;
  demo: boolean;
}

/** True when both public Supabase env vars are present. */
export function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Gate for authenticated routes. With Supabase configured it resolves the
 * real user; otherwise it accepts the local demo session cookie so the
 * product is previewable without a backend (master prompt Phase 0).
 */
export async function requireUser(): Promise<AppUser> {
  if (supabaseConfigured()) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) redirect("/login");
      return {
        id: user.id,
        email: user.email ?? null,
        name: user.email?.split("@")[0] ?? "用户",
        demo: false,
      };
    }
  }

  const cookieStore = await cookies();
  if (cookieStore.get(DEMO_COOKIE)?.value === "1") {
    return {
      id: "demo",
      email: "demo@archive.local",
      name: "演示用户",
      demo: true,
    };
  }

  redirect("/login");
}
