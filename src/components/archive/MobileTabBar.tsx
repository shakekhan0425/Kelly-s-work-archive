"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Radio, Headphones, Library, User } from "lucide-react";

/**
 * 手机端底部标签栏（≤880px 显示）。
 * 按新规范分组：Desk / Intelligence / Learn / Library / Me。
 * Learn 聚合「新闻 / 播客 / 商务英语」三类学习内容，单集入口从 /podcasts 进入。
 * 通过 env(safe-area-inset-bottom) 避开 iPhone 的 Home Indicator。
 */
const TABS = [
  { href: "/desk", label: "简报", icon: LayoutDashboard },
  { href: "/signals", label: "情报", icon: Radio },
  { href: "/podcasts", label: "学习", icon: Headphones },
  { href: "/sources", label: "资料", icon: Library },
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
