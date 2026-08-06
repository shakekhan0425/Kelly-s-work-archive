"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, FOOT_NAV, type NavItem } from "@/lib/config/nav";
import { PRODUCT } from "@/lib/config/product";

function NavLink({ item }: { item: NavItem }) {
  const path = usePathname();
  const active =
    item.href === "/"
      ? path === "/"
      : path === item.href || path.startsWith(item.href + "/");
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className="binder-link"
      aria-current={active ? "page" : undefined}
    >
      <Icon aria-hidden="true" />
      <span className="nav-cn">{item.label}</span>
      {item.badge ? (
        <span className="binder-badge">{item.badge}</span>
      ) : (
        <span className="nav-en">{item.en}</span>
      )}
    </Link>
  );
}

export function BinderSidebar() {
  return (
    <aside className="binder">
      <div className="binder-brand">
        {PRODUCT.name}
        <small>{PRODUCT.positioning}</small>
      </div>
      <nav className="binder-nav" aria-label="主导航">
        {NAV_GROUPS.map((group) => (
          <div className="binder-group" key={group.en}>
            <div className="binder-group-title">
              <span>{group.title}</span>
              <em>{group.en}</em>
            </div>
            {group.items.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </div>
        ))}
      </nav>
      <div className="binder-foot">
        {FOOT_NAV.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </div>
    </aside>
  );
}
