"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Radio, BookOpen, Building2, Bookmark } from "lucide-react";

/**
 * 手机端底部标签栏（≤880px 显示）。
 * 只放 5 个高频入口；其余栏目仍可从顶部菜单进入。
 * 通过 env(safe-area-inset-bottom) 避开 iPhone 的 Home Indicator。
 */
const TABS = [
  { href: "/desk", label: "简报", icon: LayoutDashboard },
  { href: "/signals", label: "情报", icon: Radio },
  { href: "/cases", label: "案例", icon: BookOpen },
  { href: "/companies", label: "公司", icon: Building2 },
  { href: "/favorites", label: "收藏", icon: Bookmark },
];

export function MobileTabBar() {
  const path = usePathname();
  return (
    <nav className="tabbar" aria-label="底部导航">
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="tabbar-item"
            aria-current={active ? "page" : undefined}
          >
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
