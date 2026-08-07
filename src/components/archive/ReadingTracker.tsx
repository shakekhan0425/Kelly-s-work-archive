"use client";

import { useEffect, useRef, useState } from "react";
import { loadReadPosition, saveLastRead, saveReadPosition } from "@/lib/reading";

/**
 * 详情页阅读体验：
 * 1. 顶部阅读进度条
 * 2. 记录滚动位置 —— 重开 App 或再次进入同一篇时恢复到上次读到的地方
 * 3. 记录「最后一次阅读」，供收藏页 / 简报页做继续阅读入口
 *
 * 恢复策略：只有读过 >5% 且不是从顶部刚进入时才提示恢复，避免打断正常阅读。
 */
export function ReadingTracker({
  id,
  title,
  href,
}: {
  id: string;
  title: string;
  href: string;
}) {
  const [percent, setPercent] = useState(0);
  const [resume, setResume] = useState<number | null>(null);
  const saved = useRef(0);

  // 进度 + 落盘（节流：滚动停止 400ms 后写）
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const p = max > 0 ? Math.min(100, Math.max(0, Math.round((y / max) * 100))) : 0;
      setPercent(p);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (Math.abs(y - saved.current) < 40) return;
        saved.current = y;
        saveReadPosition(id, y, p);
        saveLastRead({ id, href, title, percent: p });
      }, 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) clearTimeout(timer);
    };
  }, [id, href, title]);

  // 进入时判断是否有可恢复位置
  useEffect(() => {
    const pos = loadReadPosition(id);
    if (!pos || pos.percent < 5 || pos.percent > 96) return;
    // URL 带 #wa-resume 时直接跳，不打扰
    if (window.location.hash === "#wa-resume") {
      requestAnimationFrame(() => window.scrollTo({ top: pos.y, behavior: "auto" }));
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return;
    }
    if (window.scrollY < 100) setResume(pos.y);
  }, [id]);

  return (
    <>
      <div className="read-progress" style={{ width: `${percent}%` }} aria-hidden="true" />
      {resume !== null ? (
        <div className="resume-bar" role="status">
          <span>上次读到这里</span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              window.scrollTo({ top: resume, behavior: "smooth" });
              setResume(null);
            }}
          >
            继续阅读
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => setResume(null)}>
            从头读
          </button>
        </div>
      ) : null}
    </>
  );
}
