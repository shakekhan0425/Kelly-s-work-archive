# WORK / Archive — Data Flow Audit

> Generated: 2026-08-07

## CURRENT DATA FLOW

| Content Type | Primary Source | Fallback / Local | Notes |
|--------------|----------------|------------------|-------|
| **Signals** | Supabase (`signals` table) | `data/archive.json` (build-time static) | `live.ts` queries Supabase first; if empty/RLS-error, falls back to JSON. |
| **Cases** | Supabase (`cases` table) | `data/archive.json` | Same dual-read as signals. |
| **Podcasts** | Supabase (`podcasts` table) + `podcasts.episodes.json` (local static) | `data/archive.json` | Channel health uses local episodes JSON; shows can come from either source. |
| **Companies** | Supabase (`company_refs` table) + `COMPANY_REGISTRY` (local TS) | `data/archive.json` | Full dossiers are still in `src/lib/data/companies.registry.ts` and static `.ts` batches. |
| **Business English** | Supabase (`english` table) + `english.briefs.ts` (local static) | `data/archive.json` | Curated briefs layer is local TypeScript. |
| **Images** | Third-party URLs stored in `ArchiveItem.hero` / `showImage` / `caseStudy.image` | `ImageWithFallback` editorial cover | No image pipeline; hotlinks to source sites and Unsplash. |
| **Notes / Collections** | `localStorage` (`wa_user_store_v1`) | — | User-generated content never leaves browser. |
| **Favorites** | `localStorage` (`wa_user_store_v1`) | — | Same as notes. |
| **Watchlists** | `localStorage` (`wa_user_store_v1`) | — | Same as notes. |
| **Portfolio / Projects** | `localStorage` (`wa_user_store_v1`) | — | Same as notes. |
| **Reading position** | `localStorage` (`wa_read_pos_v1`) | — | Ephemeral UI state. |
| **Source registry** | `sources.registry.ts` (local TS) | — | Metadata only; not user content. |

## Modules Still Dependent on Local Files

1. **`src/lib/data/archive.ts`**
   - Reads `data/archive.json` at build/runtime when Supabase fails.
   - Imports `podcasts.episodes.json` and `case-studies.json` as static JSON.

2. **`src/lib/data/companies.registry.ts`** + `src/lib/data/companies/raw/*.ts`
   - Full 15-field company dossiers live in source code.
   - Supabase `company_registry` table can override, but current env uses static registry.

3. **`src/lib/data/sources.registry.ts`**
   - Source metadata is TypeScript, not database rows.

4. **`src/lib/data/english.briefs.ts`**
   - Curated business-english briefs are TypeScript.

5. **`src/lib/persistence.ts`** + `src/lib/reading.ts`
   - All user-generated state (notes, favorites, watchlists, portfolio, reading positions) is `localStorage`.

6. **`data/archive.json`**
   - Still checked into GitHub and used as fallback.

## TARGET DATA FLOW

| Content Type | Target Source | Storage | Migration Notes |
|--------------|---------------|---------|-----------------|
| **Signals** | Supabase `articles` table (renamed from `signals`) | Postgres | Remove JSON fallback; build only from Supabase. |
| **Cases** | Supabase `cases` table | Postgres | Move all case data out of `archive.json`. |
| **Companies** | Supabase `companies` table | Postgres | Move `COMPANY_REGISTRY` and raw batch files to DB; keep TS types only. |
| **Podcasts** | Supabase `podcasts`, `episodes`, `channels` tables | Postgres | Replace local `podcasts.episodes.json`. |
| **Business English** | Supabase `translations` + `vocabulary` tables | Postgres | Replace local `english.briefs.ts`. |
| **Images** | Supabase Storage `archive-assets` bucket | Storage + Postgres metadata | `storedImageUrl` primary; original URL backup. Pipeline: download → verify → WebP/AVIF → upload. |
| **Notes / Collections** | Supabase `notes` + `collections` tables | Postgres | RLS per user; localStorage only as offline cache. |
| **Favorites / Watchlists / Portfolio** | Supabase `user_lists` / `projects` tables | Postgres | Authenticated users only; demo mode can keep localStorage. |
| **Reading position** | `localStorage` only | Browser | Approved UI preference. |
| **Source registry** | Supabase `sources` table | Postgres | Move `sources.registry.ts` to DB; keep seed script. |
| **Build artifact** | No `archive.json` in repo | GitHub stores code + migrations + config only | Generate ephemeral fallback at build time if needed, do not commit scraped content. |

## Required Schema / Infra Additions

1. **Image pipeline tables**
   - `article_images(id, article_id, original_url, stored_url, status, width, height, content_type, created_at)`
   - `image_download_queue(id, url, article_id, status, attempts, last_error, created_at)`

2. **Content status fields**
   - Add to `articles`, `cases`, `companies`:
     - `content_status`: `raw | extracted | analyzed | verified | published | failed`
     - `completion_score`: int
     - `missing_fields`: text[]
     - `last_processed_at`: timestamptz
     - `processing_error`: text

3. **User data tables** (RLS enabled)
   - `notes(id, user_id, ref_id, content, created_at, updated_at)`
   - `collections(id, user_id, name, items, created_at, updated_at)`
   - `projects(id, user_id, title, situation, task, action, result, lessons, refs, updated_at)`

4. **Supabase Storage**
   - Bucket `archive-assets`, public read, service-role write.

5. **Secrets**
   - `SUPABASE_SERVICE_ROLE_KEY` for ingestion / image pipeline (Vercel env).
   - Current Vercel deployment only has `NEXT_PUBLIC_SUPABASE_ANON_KEY` (read-only).

## Migration Blockers / User Decisions

1. **Service role key**: Required before ingestion can write images and user data. Provide `SUPABASE_SERVICE_ROLE_KEY` to Vercel.
2. **Auth strategy**: Keep demo/public mode, or require login for favorites/projects?
3. **Image pipeline hosting**: Continue using Supabase Storage, or use R2/S3?
4. **Backfill scope**: Prioritize Tier A cases/companies first, then B, then hide incomplete.

## Immediate Frontend Fixes Already Applied

- `ImageWithFallback` component replaces broken image icons with editorial covers.
- Desk "Today's Intelligence" now filters out `thin` items.
- Detail pages show "档案整理中" instead of "正文待补".
