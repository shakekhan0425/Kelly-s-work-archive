/**
 * Server-safe image with a static fallback (no onError / no client interactivity).
 * 用于 server component（如 /desk）中需要「空 src 时显示占位图」的场合——
 * 服务端预渲染不允许事件处理器，故不依赖 onError，仅在 src 为空时直接渲染兜底。
 * 需要运行时加载失败兜底的 client 组件请用 ImageWithFallback。
 */
interface ServerImageProps {
  src?: string | null;
  className?: string;
  alt?: string;
  loading?: "eager" | "lazy";
  fallback?: { source?: string; category?: string; date?: string };
}

export default function ServerImage({
  src,
  className = "",
  alt = "",
  loading = "lazy",
  fallback,
}: ServerImageProps) {
  if (!src) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt || "封面待补"}>
        <span className="img-fallback-source">{fallback?.source ?? "WORK"}</span>
        <span className="img-fallback-category">{fallback?.category ?? "ARCHIVE"}</span>
        {fallback?.date ? <span className="img-fallback-date">{fallback.date}</span> : null}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} loading={loading} />
  );
}
