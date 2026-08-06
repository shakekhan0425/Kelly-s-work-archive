/**
 * 持久化层（Phase 6 / 全部继续）。
 *
 * 设计：localStorage 优先。无 Supabase 凭据时（当前 demo 默认）所有用户数据
 * 落在浏览器本地；配置 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 后，可把同一份
 * 结构镜像到 Supabase（见 supabase/0001_user_data.sql，已带 RLS）。
 *
 * 数据全部是用户自生成内容（笔记 / 收藏 / 观察名单 / 作品集草稿），
 * 不含任何受版权保护的正文抓取内容——符合产品「不存受版权内容」的硬约束。
 */

export type RefType = "signal" | "case" | "company" | "source" | "podcast";

export interface WatchItem {
  type: RefType;
  ref: string;
  label: string;
  note?: string;
}

export interface Watchlist {
  id: string;
  name: string;
  createdAt: string;
  items: WatchItem[];
}

export interface PortfolioStory {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  lessons: string;
  refs: string[];
  updatedAt: string;
}

export interface UserStore {
  notes: Record<string, string>;
  favorites: string[];
  watchlists: Watchlist[];
  portfolio: PortfolioStory[];
}

const KEY = "wa_user_store_v1";

function emptyStore(): UserStore {
  return { notes: {}, favorites: [], watchlists: [], portfolio: [] };
}

export function loadStore(): UserStore {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw);
    return {
      notes: parsed.notes ?? {},
      favorites: parsed.favorites ?? [],
      watchlists: parsed.watchlists ?? [],
      portfolio: parsed.portfolio ?? [],
    };
  } catch {
    return emptyStore();
  }
}

export function saveStore(s: UserStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* 配额满 / 隐私模式：静默失败，不影响浏览 */
  }
}

/* ── 笔记 ── */
export function getNote(s: UserStore, id: string): string {
  return s.notes[id] ?? "";
}
export function setNote(s: UserStore, id: string, text: string): UserStore {
  const notes = { ...s.notes };
  if (text.trim()) notes[id] = text;
  else delete notes[id];
  return { ...s, notes };
}

/* ── 收藏 ── */
export function isFavorite(s: UserStore, id: string): boolean {
  return s.favorites.includes(id);
}
export function toggleFavorite(s: UserStore, id: string): UserStore {
  const favorites = s.favorites.includes(id)
    ? s.favorites.filter((x) => x !== id)
    : [id, ...s.favorites];
  return { ...s, favorites };
}

/* ── 观察名单 ── */
export function addWatchlist(s: UserStore, name: string): UserStore {
  const id = `wl_${Date.now().toString(36)}`;
  const wl: Watchlist = { id, name: name.trim() || "未命名名单", createdAt: new Date().toISOString(), items: [] };
  return { ...s, watchlists: [wl, ...s.watchlists] };
}
export function deleteWatchlist(s: UserStore, id: string): UserStore {
  return { ...s, watchlists: s.watchlists.filter((w) => w.id !== id) };
}
export function addToWatchlist(s: UserStore, listId: string, item: WatchItem): UserStore {
  return {
    ...s,
    watchlists: s.watchlists.map((w) =>
      w.id === listId && !w.items.some((i) => i.ref === item.ref && i.type === item.type)
        ? { ...w, items: [item, ...w.items] }
        : w,
    ),
  };
}
export function removeFromWatchlist(s: UserStore, listId: string, ref: string, type: RefType): UserStore {
  return {
    ...s,
    watchlists: s.watchlists.map((w) =>
      w.id === listId ? { ...w, items: w.items.filter((i) => !(i.ref === ref && i.type === type)) } : w,
    ),
  };
}

/* ── 作品集 ── */
export function upsertPortfolio(s: UserStore, story: PortfolioStory): UserStore {
  const exists = s.portfolio.some((p) => p.id === story.id);
  return {
    ...s,
    portfolio: exists ? s.portfolio.map((p) => (p.id === story.id ? story : p)) : [story, ...s.portfolio],
  };
}
export function deletePortfolio(s: UserStore, id: string): UserStore {
  return { ...s, portfolio: s.portfolio.filter((p) => p.id !== id) };
}
