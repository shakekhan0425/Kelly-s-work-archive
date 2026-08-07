"use client";

/**
 * 路由级淡入过渡：每次导航都会重新挂载，给内容一个轻快的淡入，
 * 与全局 ≤100ms 点击反馈、骨架屏共同构成连贯的加载体验。
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-fade">{children}</div>;
}
