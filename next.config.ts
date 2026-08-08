import path from "node:path";
import type { NextConfig } from "next";

const cloudflareBuild = process.env.CF_WORKERS_BUILD === "1";
const localArchiveFile = cloudflareBuild
  ? "local-archive-empty.ts"
  : "local-archive-full.ts";
const localArchiveModule = path.resolve(process.cwd(), "src/lib/data", localArchiveFile);

const nextConfig: NextConfig = {
  // Dynamic rendering: pages are server-rendered on request and read from
  // Supabase (or local JSON fallback). Enables runtime auto-update + pagination.
  images: { unoptimized: true },
  trailingSlash: true,
  turbopack: {
    resolveAlias: {
      "@archive-data": `./src/lib/data/${localArchiveFile}`,
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@archive-data": localArchiveModule,
    };
    return config;
  },
};

export default nextConfig;
