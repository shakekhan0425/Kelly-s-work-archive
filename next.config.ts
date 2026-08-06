import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic rendering: pages are server-rendered on request and read from
  // Supabase (or local JSON fallback). Enables runtime auto-update + pagination.
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
