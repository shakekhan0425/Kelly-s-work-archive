import type { Archive } from "./types";
import archiveData from "../../../data/archive.json";

export function getLocalArchive(): Archive {
  const parsed = archiveData as Archive;
  for (const item of parsed.signals) item.thin = false;
  for (const item of parsed.cases) {
    if (typeof item.thin !== "boolean") item.thin = false;
    if (!item.thin && (!item.blocks || item.blocks.length === 0)) item.thin = true;
  }
  parsed.podcastShows = parsed.podcastShows ?? parsed.podcasts;
  return parsed;
}
