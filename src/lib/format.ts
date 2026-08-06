/**
 * Client-safe date formatting. Kept free of `server-only` / `fs` so it can be
 * imported by both server and client components (e.g. ItemRow).
 */

export function formatDate(iso: string, lang: "zh" | "en" = "zh"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  if (lang === "en") {
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

export function relativeTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  if (isNaN(d)) return "";
  const diff = Date.now() - d;
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "刚刚";
  if (h < 24) return `${h} 小时前`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days} 天前`;
  return formatDate(iso);
}
