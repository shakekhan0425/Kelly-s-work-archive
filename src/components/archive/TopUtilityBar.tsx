"use client";

import { Search, Bell, Plus, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";
import type { AppUser } from "@/lib/auth";

interface Props {
  user: AppUser;
  /** last successful data update, human readable */
  updatedAt?: string;
}

export function TopUtilityBar({ user, updatedAt = "—" }: Props) {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const initial = (user.name || "U").slice(0, 1).toUpperCase();

  return (
    <header className="utility-bar">
      {!online && (
        <span className="stamp" style={{ display: "inline-flex", gap: 6 }}>
          <WifiOff size={13} /> Offline archive mode
        </span>
      )}
      <form className="utility-search" role="search" action="/search" method="get">
        <Search size={16} aria-hidden="true" />
        <input
          name="q"
          placeholder="搜索情报、案例、公司、英语…"
          aria-label="全局搜索"
          autoComplete="off"
        />
        <span className="kbd">⌘K</span>
      </form>

      <button className="btn btn-primary" type="button">
        <Plus size={15} style={{ verticalAlign: "-2px", marginRight: 4 }} />
        Save
      </button>
      <button className="icon-btn" type="button" aria-label="通知">
        <Bell size={18} />
      </button>
      <span className="stamp" title="数据最近更新时间">
        更新于 {updatedAt}
      </span>

      <span className="binder-link" style={{ padding: "4px 10px", marginLeft: "auto" }}>
        <span
          aria-hidden="true"
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--color-archive-red)",
            color: "var(--color-paper-light)",
            display: "grid",
            placeItems: "center",
            fontFamily: "var(--font-display)",
            fontSize: 14,
          }}
        >
          {initial}
        </span>
        <span className="nav-cn">{user.name}</span>
      </span>
    </header>
  );
}
