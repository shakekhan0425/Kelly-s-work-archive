"use client";

import { useState } from "react";

interface ServerImageProps {
  src?: string | null;
  className?: string;
  alt?: string;
  loading?: "eager" | "lazy";
  fallback?: { source?: string; category?: string; date?: string };
}

/**
 * Server-render friendly image with runtime fallback.
 *
 * The component itself is a Client Component (so it can handle `onError`),
 * but it is safe to render inside Server Components because it does not
 * rely on browser-only APIs during the initial render.
 */
export default function ServerImage({
  src,
  className = "",
  alt = "",
  loading = "lazy",
  fallback,
}: ServerImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
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
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setFailed(true)}
    />
  );
}
