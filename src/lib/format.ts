/**
 * Client-safe date formatting. Kept free of `server-only` / `fs` so it can be
 * imported by both server and client components (e.g. ItemRow).
 */

export function formatDate(iso: string, lang: "zh" | "en" = "zh"): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const timeZone = "Asia/Shanghai";
  if (lang === "en") {
    return d.toLocaleDateString("en-US", {
      timeZone,
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}.${values.month}.${values.day}`;
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
