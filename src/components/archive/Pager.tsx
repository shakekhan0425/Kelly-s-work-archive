"use client";

import Link from "next/link";

/** 分页器：保留现有筛选参数（v/t/c/s/...），仅切换 p。queryString 为服务端传入的原始查询串。 */
export function Pager({
  basePath,
  queryString,
  page,
  pages,
}: {
  basePath: string;
  queryString: string;
  page: number;
  pages: number;
}) {
  if (pages <= 1) return null;

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams(queryString);
    if (p <= 1) sp.delete("p");
    else sp.set("p", String(p));
    const q = sp.toString();
    return q ? `${basePath}?${q}` : basePath;
  };

  const nums: (number | "…")[] = [];
  const push = (n: number) => nums.push(n);
  push(1);
  const start = Math.max(2, page - 1);
  const end = Math.min(pages - 1, page + 1);
  if (start > 2) nums.push("…");
  for (let i = start; i <= end; i++) push(i);
  if (end < pages - 1) nums.push("…");
  if (pages > 1) push(pages);

  return (
    <nav className="pager" aria-label="分页">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)}>‹</Link>
      ) : (
        <span className="pager-dis">‹</span>
      )}
      {nums.map((n, i) =>
        n === "…" ? (
          <span key={`e${i}`} className="pager-ell">
            …
          </span>
        ) : n === page ? (
          <span key={n} className="pager-cur">
            {n}
          </span>
        ) : (
          <Link key={n} href={hrefFor(n)}>
            {n}
          </Link>
        ),
      )}
      {page < pages ? (
        <Link href={hrefFor(page + 1)}>›</Link>
      ) : (
        <span className="pager-dis">›</span>
      )}
    </nav>
  );
}
