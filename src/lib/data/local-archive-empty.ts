import type { Archive } from "./types";

const EMPTY: Archive = {
  generatedAt: "",
  stats: {
    signals: 0,
    cases: 0,
    podcasts: 0,
    english: 0,
    companies: 0,
    sources: 0,
    withBody: 0,
    withHero: 0,
  },
  signals: [],
  cases: [],
  podcasts: [],
  podcastShows: [],
  english: [],
  topics: [],
  companies: [],
  sources: [],
};

export function getLocalArchive(): Archive {
  return EMPTY;
}
