"use client";

import { Bookmark } from "lucide-react";
import { useFavorites } from "@/lib/use-persistence";

export default function FavoriteButton({ itemId }: { itemId: string }) {
  const { favorites, toggle, ready } = useFavorites();
  const on = ready && favorites.includes(itemId);
  return (
    <button
      type="button"
      className={`fav-btn ${on ? "on" : ""}`}
      onClick={() => toggle(itemId)}
      aria-pressed={on}
      title={on ? "取消收藏" : "收藏"}
    >
      <Bookmark size={15} />
      <span>{on ? "已收藏" : "收藏"}</span>
    </button>
  );
}
