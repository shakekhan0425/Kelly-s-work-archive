"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Bookmark, WifiOff, CloudDownload, History } from "lucide-react";
import { useFavorites } from "@/lib/use-persistence";
import { SectionHeader } from "./SectionHeader";
import { formatDate } from "@/lib/format";
import { loadLastRead, type LastRead } from "@/lib/reading";

export interface FavEntry {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  kind: "signal" | "case" | "podcast";
  href: string;
}

const KIND_LABEL: Record<FavEntry["kind"], string> = {
  signal: "市场情报",
  case: "品牌案例",
  podcast: "播客",
};

export default function FavoritesBoard({ index }: { index: FavEntry[] }) {
  const { favorites, toggle, ready } = useFavorites();
  const [offline, setOffline] = useState(false);
  const [cached, setCached] = useState<Set<string>>(new Set());
  const [last, setLast] = useState<LastRead | null>(null);
  const [caching, setCaching] = useState(false);

  const map = useMemo(() => new Map(index.map((e) => [e.id, e])), [index]);
  const items = useMemo(
    () => favorites.map((id) => map.get(id)).filter((x): x is FavEntry => Boolean(x)),
    [favorites, map],
  );

  // 网络状态
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  // 上次阅读位置
  useEffect(() => setLast(loadLastRead()), []);

  // 查询哪些收藏已离线缓存
  useEffect(() => {
    if (!("caches" in window) || items.length === 0) return;
    let alive = true;
    (async () => {
      const found = new Set<string>();
      for (const it of items) {
        const hit = await caches.match(new Request(it.href, { mode: "no-cors" }));
        if (hit) found.add(it.id);
      }
      if (alive) setCached(found);
    })();
    return () => {
      alive = false;
    };
  }, [items]);

  // 一键把所有收藏正文存到离线缓存
  async function cacheAll() {
    if (!("serviceWorker" in navigator)) return;
    setCaching(true);
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type: "CACHE_PAGES", urls: items.map((i) => i.href) });
    // 给 SW 一点时间抓取，然后复查
    setTimeout(async () => {
      const found = new Set<string>();
      for (const it of items) {
        const hit = await caches.match(new Request(it.href, { mode: "no-cors" }));
        if (hit) found.add(it.id);
      }
      setCached(found);
      setCaching(false);
    }, 2500);
  }

  const lastEntry = last ? map.get(last.id) : undefined;

  return (
    <>
      <section className="paper-panel" style={{ padding: 20, marginBottom: 20 }}>
        <span className="bookmark-fold" aria-hidden="true" />
        <SectionHeader
          eyebrow="Favorites"
          title="我的收藏"
          action={{ href: "/collections", label: "主题收藏集" }}
        />
        <p className="list-dek" style={{ maxWidth: "72ch" }}>
          收藏自动同步到云端，无需账户。点「离线存档」可把正文缓存到本地，断网也能继续阅读。
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
          {items.length > 0 ? (
            <button type="button" className="btn" onClick={cacheAll} disabled={caching}>
              <CloudDownload size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
              {caching ? "存档中…" : `离线存档（${items.length}）`}
            </button>
          ) : null}
          {offline ? (
            <span className="stamp stamp-coral">
              <WifiOff size={12} style={{ marginRight: 4, verticalAlign: "-2px" }} />
              当前离线
            </span>
          ) : null}
        </div>
      </section>

      {lastEntry && last ? (
        <section className="paper-panel" style={{ padding: 16, marginBottom: 20 }}>
          <div className="meta-line" style={{ marginBottom: 6 }}>
            <History size={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />
            继续上次阅读
            {last.percent > 2 ? <span className="sep">/</span> : null}
            {last.percent > 2 ? <span>已读 {last.percent}%</span> : null}
          </div>
          <h3 className="list-title" style={{ margin: 0 }}>
            <Link href={`${lastEntry.href}#wa-resume`}>{lastEntry.title}</Link>
          </h3>
        </section>
      ) : null}

      {!ready ? (
        <p className="list-dek">读取中…</p>
      ) : items.length === 0 ? (
        <section className="paper-panel" style={{ padding: 28, textAlign: "center" }}>
          <Bookmark size={22} style={{ opacity: 0.4 }} />
          <p className="list-dek" style={{ marginTop: 10 }}>
            还没有收藏。在任意情报或案例详情页点「收藏」，条目会出现在这里。
          </p>
          <Link href="/signals" className="btn btn-primary" style={{ marginTop: 12, display: "inline-block" }}>
            去市场情报挑一条
          </Link>
        </section>
      ) : (
        <div className="paper-panel" style={{ padding: "4px 20px 16px" }}>
          {items.map((it) => (
            <article key={it.id} className="list-row" style={{ gridTemplateColumns: "1fr" }}>
              <div style={{ minWidth: 0 }}>
                <div className="meta-line">
                  <span style={{ color: "var(--color-archive-red)" }}>{it.source}</span>
                  <span className="sep">/</span>
                  <span>{KIND_LABEL[it.kind]}</span>
                  {it.date ? (
                    <>
                      <span className="sep">/</span>
                      <span>{formatDate(it.date)}</span>
                    </>
                  ) : null}
                  {cached.has(it.id) ? <span className="stamp stamp-lav">已离线</span> : null}
                </div>
                <h3 className="list-title">
                  <Link href={it.href}>{it.title}</Link>
                </h3>
                {it.summary ? <p className="list-dek">{it.summary}</p> : null}
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ padding: "4px 0", fontSize: 12 }}
                  onClick={() => toggle(it.id)}
                >
                  移出收藏
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
