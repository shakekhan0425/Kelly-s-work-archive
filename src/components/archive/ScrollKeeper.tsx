"use client";

import { useEffect } from "react";
import { loadReturnContext, popReturnContext } from "@/lib/navigation";

/**
 * 列表页滚动位置保持。
 * 当从详情页返回（存在匹配的返回上下文）时，恢复到离开时的滚动位置，并消费该上下文。
 * 仅在真正的「返回」场景触发，避免干扰前向导航。
 */
export function ScrollKeeper({ route }: { route: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const ctx = loadReturnContext();
    if (ctx && ctx.fromRoute === route && typeof ctx.scrollY === "number") {
      const y = ctx.scrollY;
      // 等首屏绘制完成再恢复，确保内容已渲染到正确高度
      const id = requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "auto" });
        popReturnContext();
      });
      return () => cancelAnimationFrame(id);
    }
    return undefined;
  }, [route]);

  return null;
}
