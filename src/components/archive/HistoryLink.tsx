"use client";

import Link from "next/link";
import { saveReturnContext } from "@/lib/navigation";

/**
 * 记录「来源上下文」后再跳转的链接。
 * 点击时把当前滚动位置 + 来源路由写入返回上下文，供详情页返回与 ScrollKeeper 恢复。
 */
export function HistoryLink({
  href,
  backRoute,
  backLabel,
  className,
  children,
}: {
  href: string;
  backRoute: string;
  backLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        saveReturnContext({
          fromRoute: backRoute,
          fromLabel: backLabel,
          scrollY: typeof window !== "undefined" ? window.scrollY : 0,
        })
      }
    >
      {children}
    </Link>
  );
}
