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

/**
 * 统一用户存储 hook（localStorage 优先）。
 * 每个组件读取时都重新从 localStorage 取数，因此跨页面导航天然一致。
 */
export function useUserStore() {
  const [store, setStore] = useState<UserStore | null>(null);

  useEffect(() => {
    setStore(loadStore());
  }, []);

  const update = useCallback((mut: (s: UserStore) => UserStore) => {
    setStore((prev) => {
      const base = prev ?? loadStore();
      const next = mut(base);
      saveStore(next);
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
