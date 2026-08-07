"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Radio, Headphones, Library, User } from "lucide-react";

/**
 * 手机端底部标签栏（≤880px 显示）。
 * 按内容类型分组：今日 / 情报 / 播客 / 来源 / 我的。
 * 通过 env(safe-area-inset-bottom) 避开 iPhone 的 Home Indicator。
 */
const TABS = [
  { href: "/desk", label: "今日", icon: LayoutDashboard },
  { href: "/signals", label: "情报", icon: Radio },
  { href: "/podcasts", label: "播客", icon: Headphones },
  { href: "/sources", label: "来源", icon: Library },
  { href: "/profile", label: "我的", icon: User },
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
