"use client";

import { Bookmark } from "lucide-react";
import { useCallback } from "react";
import { useFavorites } from "@/lib/use-persistence";

/**
 * 收藏按钮。收藏时顺带请求 Service Worker 把当前正文存进离线缓存，
 * 这样断网/地铁里打开 App 仍能读已收藏的文章。
 */
export default function FavoriteButton({ itemId }: { itemId: string }) {
  const { favorites, toggle, ready } = useFavorites();
  const on = ready && favorites.includes(itemId);

  const handle = useCallback(() => {
    const willAdd = !on;
    toggle(itemId);
    if (willAdd && typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready
        .then((reg) =>
          reg.active?.postMessage({
            type: "CACHE_PAGES",
            urls: [window.location.pathname],
          }),
        )
        .catch(() => {
          /* SW 未就绪时忽略，收藏本身不受影响 */
        });
    }
  }, [on, itemId, toggle]);

  return (
    <button
      type="button"
      className={`fav-btn ${on ? "on" : ""}`}
      onClick={handle}
      aria-pressed={on}
      title={on ? "取消收藏" : "收藏（并存离线）"}
    >
      <Bookmark size={15} />
      <span>{on ? "已收藏" : "收藏"}</span>
    </button>
  );
}
