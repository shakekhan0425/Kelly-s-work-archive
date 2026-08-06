"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadReturnContext, popReturnContext } from "@/lib/navigation";

/**
 * 详情页「返回」按钮。
 * - 优先使用浏览器 history.back()，从而恢复上一个列表页的滚动位置与 URL 筛选（Next.js 自动还原）。
 * - 仅当存在站内返回上下文时才调用 router.back()；直接打开详情（无上下文）时回退到 fallback 列表路由。
 * - 初始渲染固定使用 fallbackLabel（SSR 与客户端一致，避免 hydration 不匹配），挂载后再按返回上下文更新标签。
 *
 * 修复（审计 G）：
 * - 不再依赖 window.history.length > 1（无法区分上一页是否本站，可能返回搜索引擎/站外）。
 * - 改用站内返回上下文栈判定，返回时弹出一层，支持 信号 → 公司 → 案例 逐层返回。
 */
export function BackButton({
  fallbackHref,
  fallbackLabel,
  className,
}: {
  fallbackHref: string;
  fallbackLabel: string;
  className?: string;
}) {
  const router = useRouter();
  const [label, setLabel] = useState(fallbackLabel);

  useEffect(() => {
    const ctx = loadReturnContext();
    if (ctx?.fromLabel) setLabel(ctx.fromLabel);
  }, []);

  return (
    <button
      type="button"
      className={`back-link ${className ?? ""}`}
      onClick={() => {
        // 仅当存在站内返回上下文时回退一层；否则显式跳转 fallback（真实可独立访问的列表路由）。
        if (typeof window !== "undefined" && loadReturnContext()) {
          popReturnContext();
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
    >
      ← {label}
    </button>
  );
}
