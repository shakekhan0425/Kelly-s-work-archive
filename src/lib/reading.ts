/**
 * 阅读位置记忆。
 * - 每篇详情页记录滚动百分比，重开 App / 重新进入同一篇时恢复。
 * - 另记录「最后一次阅读」，供收藏页与首页做「继续阅读」入口。
 * 全部存 localStorage，无账户依赖。
 */

const POS_KEY = "wa_read_pos_v1";
const LAST_KEY = "wa_last_read_v1";
const MAX_ENTRIES = 200;

export interface LastRead {
  id: string;
  href: string;
  title: string;
  percent: number;
  at: number;
}

type PosMap = Record<string, { y: number; percent: number; at: number }>;

function readPos(): PosMap {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(POS_KEY) || "{}") as PosMap;
  } catch {
    return {};
  }
}

function writePos(map: PosMap) {
  try {
    // 控制体积：只保留最近 MAX_ENTRIES 条
    const entries = Object.entries(map).sort((a, b) => b[1].at - a[1].at).slice(0, MAX_ENTRIES);
    localStorage.setItem(POS_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    /* 配额满时静默失败，不影响阅读 */
  }
}

export function saveReadPosition(id: string, y: number, percent: number) {
  if (typeof window === "undefined") return;
  const map = readPos();
  map[id] = { y, percent, at: Date.now() };
  writePos(map);
}

export function loadReadPosition(id: string): { y: number; percent: number } | null {
  const hit = readPos()[id];
  return hit ? { y: hit.y, percent: hit.percent } : null;
}

export function saveLastRead(entry: Omit<LastRead, "at">) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ ...entry, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function loadLastRead(): LastRead | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_KEY);
    return raw ? (JSON.parse(raw) as LastRead) : null;
  } catch {
    return null;
  }
}
