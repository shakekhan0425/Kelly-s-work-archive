"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadStore,
  saveStore,
  type PortfolioStory,
  type RefType,
  type UserStore,
  type WatchItem,
  type Watchlist,
} from "./persistence";
import { getBrowserSupabase } from "./supabase/client";

/**
 * 统一用户存储 hook（离线优先 + Supabase 云端同步）。
 * - 立即从 localStorage 取数（跨页一致、首屏不闪）。
 * - 挂载时后台从 Supabase 匿名桶水合：云端有数据则合并，云端空且有本地数据则把本地迁上去。
 * - 每次变更：先写 localStorage（即时），再后台 upsert 到 Supabase。
 * 表未建 / 离线时静默回退 localStorage，不影响浏览。
 */
const BUCKET = "kelly_global";

export function useUserStore() {
  const [store, setStore] = useState<UserStore | null>(null);

  useEffect(() => {
    const local = loadStore();
    setStore(local);
    let cancelled = false;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) return;
      try {
        const { data, error } = await sb
          .from("user_data")
          .select("data, updated_at")
          .eq("id", BUCKET)
          .maybeSingle();
        if (cancelled || error) return;
        if (data?.data) {
          const remote = data.data as Partial<UserStore>;
          const merged = mergeStores(local, remote);
          setStore(merged);
          saveStore(merged);
        } else if (hasContent(local)) {
          await sb
            .from("user_data")
            .upsert({ id: BUCKET, data: local, updated_at: new Date().toISOString() });
        }
      } catch {
        /* 离线 / 表未建：保持本地 */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((mut: (s: UserStore) => UserStore) => {
    setStore((prev) => {
      const base = prev ?? loadStore();
      const next = mut(base);
      saveStore(next);
      pushRemote(next);
      return next;
    });
  }, []);

  return { store, update, ready: store !== null };
}

/* ── 笔记 ── */
export function useNote(id: string) {
  const { store, update, ready } = useUserStore();
  const value = store?.notes[id] ?? "";
  const set = useCallback(
    (text: string) => update((s) => {
      const notes = { ...s.notes };
      if (text.trim()) notes[id] = text;
      else delete notes[id];
      return { ...s, notes };
    }),
    [id, update],
  );
  return { value, set, ready };
}

/* ── 收藏 ── */
export function useFavorites() {
  const { store, update, ready } = useUserStore();
  const toggle = useCallback(
    (id: string) =>
      update((s) => {
        const favorites = s.favorites.includes(id)
          ? s.favorites.filter((x) => x !== id)
          : [id, ...s.favorites];
        return { ...s, favorites };
      }),
    [update],
  );
  return { favorites: store?.favorites ?? [], toggle, ready };
}

/* ── 观察名单 ── */
export function useWatchlists() {
  const { store, update, ready } = useUserStore();
  const addList = useCallback(
    (name: string) => update((s) => {
      const id = `wl_${Date.now().toString(36)}`;
      return {
        ...s,
        watchlists: [
          { id, name: name.trim() || "未命名名单", createdAt: new Date().toISOString(), items: [] },
          ...s.watchlists,
        ],
      };
    }),
    [update],
  );
  const deleteList = useCallback(
    (listId: string) => update((s) => ({ ...s, watchlists: s.watchlists.filter((w) => w.id !== listId) })),
    [update],
  );
  const addItem = useCallback(
    (listId: string, item: WatchItem) =>
      update((s) => ({
        ...s,
        watchlists: s.watchlists.map((w) =>
          w.id === listId && !w.items.some((i) => i.ref === item.ref && i.type === item.type)
            ? { ...w, items: [item, ...w.items] }
            : w,
        ),
      })),
    [update],
  );
  const removeItem = useCallback(
    (listId: string, ref: string, type: RefType) =>
      update((s) => ({
        ...s,
        watchlists: s.watchlists.map((w) =>
          w.id === listId
            ? { ...w, items: w.items.filter((i) => !(i.ref === ref && i.type === type)) }
            : w,
        ),
      })),
    [update],
  );
  return {
    watchlists: store?.watchlists ?? [],
    addList,
    deleteList,
    addItem,
    removeItem,
    ready,
  };
}

/* ── 作品集 ── */
export function usePortfolio() {
  const { store, update, ready } = useUserStore();
  const upsert = useCallback(
    (story: PortfolioStory) =>
      update((s) => {
        const exists = s.portfolio.some((p) => p.id === story.id);
        return {
          ...s,
          portfolio: exists ? s.portfolio.map((p) => (p.id === story.id ? story : p)) : [story, ...s.portfolio],
        };
      }),
    [update],
  );
  const remove = useCallback(
    (id: string) => update((s) => ({ ...s, portfolio: s.portfolio.filter((p) => p.id !== id) })),
    [update],
  );
  return { stories: store?.portfolio ?? [], upsert, remove, ready };
}

export type { Watchlist, WatchItem, PortfolioStory };

/* ── 云端同步辅助 ── */
function hasContent(s: UserStore): boolean {
  return (
    Object.keys(s.notes).length > 0 ||
    s.favorites.length > 0 ||
    s.watchlists.length > 0 ||
    s.portfolio.length > 0
  );
}

function mergeStores(local: UserStore, remote: Partial<UserStore>): UserStore {
  const notes = { ...local.notes, ...(remote.notes ?? {}) };
  const favorites = Array.from(new Set([...local.favorites, ...(remote.favorites ?? [])]));
  const watchlists = mergeById(local.watchlists, remote.watchlists ?? []);
  const portfolio = mergeById(local.portfolio, remote.portfolio ?? []);
  return { notes, favorites, watchlists, portfolio };
}

function mergeById<T extends { id: string }>(a: T[], b: T[]): T[] {
  const map = new Map<string, T>();
  for (const x of a) map.set(x.id, x);
  for (const x of b) map.set(x.id, x);
  return Array.from(map.values());
}

function pushRemote(s: UserStore) {
  const sb = getBrowserSupabase();
  if (!sb) return;
  sb.from("user_data")
    .upsert({ id: BUCKET, data: s, updated_at: new Date().toISOString() })
    .then(() => {}, () => {});
}
