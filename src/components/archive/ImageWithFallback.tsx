"use client";

import { useState } from "react";

interface ImageWithFallbackProps {
  src?: string;
  originalSrc?: string;
  alt?: string;
  className?: string;
  loading?: "eager" | "lazy";
  fallback?: {
    source?: string;
    category?: string;
    date?: string;
  };
}

export default function ImageWithFallback({
  src,
  originalSrc,
  alt = "",
  className = "",
  loading = "lazy",
  fallback,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  const imgSrc = src || originalSrc;

  if (error || !imgSrc) {
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
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setError(true)}
    />
  );
}
