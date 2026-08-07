"use client";

import { Search, Bell, Plus, WifiOff, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppUser } from "@/lib/auth";
import { NAV_GROUPS, FOOT_NAV, type NavItem } from "@/lib/config/nav";

interface Props {
  user: AppUser;
  /** last successful data update, human readable */
  updatedAt?: string;
}

function MobileNavLink({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const path = usePathname();
  const active = item.href === "/" ? path === "/" : path === item.href || path.startsWith(item.href + "/");
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="mobnav-link"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      <Icon size={18} aria-hidden="true" />
      <span>{item.label}</span>
      <em>{item.en}</em>
    </Link>
  );
}

export function TopUtilityBar({ user, updatedAt = "—" }: Props) {
  const [online, setOnline] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const initial = (user.name || "U").slice(0, 1).toUpperCase();

  return (
    <>
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
        <span className="stamp desktop-only" title="数据最近更新时间">
          更新于 {updatedAt}
        </span>

        <button
          className="icon-btn mobnav-trigger"
          type="button"
          aria-label="打开导航"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <Menu size={18} />
        </button>

        <span className="binder-link desktop-only" style={{ padding: "4px 10px", marginLeft: "auto" }}>
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

      {menuOpen && (
        <div className="mobnav-sheet" role="dialog" aria-modal="true" aria-label="站点导航">
          <div className="mobnav-backdrop" onClick={() => setMenuOpen(false)} />
          <div className="mobnav-panel">
            <div className="mobnav-head">
              <div>
                <div className="mobnav-kicker">Navigation</div>
                <div className="mobnav-title">全部入口</div>
              </div>
              <button
                className="icon-btn"
                type="button"
                aria-label="关闭导航"
                onClick={() => setMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="mobnav-body">
              {NAV_GROUPS.map((group) => (
                <div className="mobnav-group" key={group.en}>
                  <div className="mobnav-group-title">
                    <span>{group.title}</span>
                    <em>{group.en}</em>
                  </div>
                  <div className="mobnav-links">
                    {group.items.map((item) => (
                      <MobileNavLink key={item.href} item={item} onClick={() => setMenuOpen(false)} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="mobnav-links" style={{ marginTop: 8 }}>
                {FOOT_NAV.map((item) => (
                  <MobileNavLink key={item.href} item={item} onClick={() => setMenuOpen(false)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
