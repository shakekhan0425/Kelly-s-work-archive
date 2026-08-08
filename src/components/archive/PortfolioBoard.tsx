import Link from "next/link";
import type { CaseStudy } from "@/lib/data/types";
import ImageWithFallback from "@/components/archive/ImageWithFallback";

/* Curated Unsplash lifestyle photography mapped by case id.
   Using real editorial/lifestyle imagery lets the wall feel like
   a Xiaohongshu discovery feed without depending on scraped screenshots. */
const COVER_IMAGES: Record<string, string> = {
  case_7k8m02:
    "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80",
  case_7a8m01:
    "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&q=80",
  case_6w8m01:
    "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800&q=80",
  case_6y8m01:
    "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80",
  case_7c8m02:
    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
  case_7h8m02:
    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&q=80",
  case_798m01:
    "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=800&q=80",
  case_7i8m02:
    "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
  case_xhs_pd:
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80",
  case_xhs_hxz:
    "https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=800&q=80",
  case_xhs_jn:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  case_xhs_ta:
    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
  case_xhs_ub:
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  case_xhs_mn:
    "https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80",
  case_xhs_pop:
    "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=800&q=80",
  case_xhs_te:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80",
};

function hashNumber(str: string, i: number) {
  let h = 0;
  for (const ch of str + String(i)) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return h;
}

function postMetrics(title: string) {
  const h = hashNumber(title, 1);
  const likes = 200 + (h % 1800);
  const saves = 40 + (h % 420);
  const comments = 10 + (h % 190);
  const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));
  return { likes: fmt(likes), saves: fmt(saves), comments: String(comments) };
}

function coverImage(post: CaseStudy): string {
  if (COVER_IMAGES[post.id]) return COVER_IMAGES[post.id];
  // deterministic fallback
  const pool = Object.values(COVER_IMAGES);
  let h = 0;
  for (const ch of post.id) h = (h * 31 + ch.charCodeAt(0)) % pool.length;
  return pool[h];
}

function avatarSeed(str: string) {
  const colors = ["#a72a2c", "#6e7059", "#b08d57", "#5a7a96", "#8a6d8a"];
  let h = 0;
  for (const ch of str) h = (h * 31 + ch.charCodeAt(0)) % colors.length;
  return colors[h];
}

function formatLikes(n: number) {
  if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, "") + "w";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return String(n);
}

export default function PortfolioBoard({ xhsPosts }: { xhsPosts: CaseStudy[] }) {
  return (
    <div className="pf-wrap">
      <header className="src-hero" style={{ marginBottom: 26 }}>
        <div className="src-kicker">Xiaohongshu Inspiration</div>
        <h1 className="src-title">小红书灵感墙</h1>
        <p className="src-lead">
          像刷小红书一样浏览真实 campaign 拆解。点卡片进入完整案例。
        </p>
      </header>

      <section className="pf-xhs-wall">
        <div className="pf-xhs-grid">
          {xhsPosts.map((post) => {
            const metrics = postMetrics(post.campaignName);
            const tags = [
              ...(post.channelRoles?.map((r) => r.channel) || []),
              post.market,
            ]
              .filter(Boolean)
              .slice(0, 2);
            const likesNum =
              parseFloat(metrics.likes.replace(/[kw]/, "")) *
              (metrics.likes.includes("w") ? 10000 : metrics.likes.includes("k") ? 1000 : 1);
            return (
              <Link
                key={post.id}
                href={`/cases/${post.id}`}
                className="pf-xhs-card"
              >
                <div className="pf-xhs-cover-wrap">
                    <ImageWithFallback
                    className="pf-xhs-cover"
                    src={coverImage(post)}
                    alt={post.campaignName}
                    loading="lazy"
                    fallback={{ source: post.brand || "CASE", category: "" }}
                  />
                </div>
                <div className="pf-xhs-body">
                  <h4 className="pf-xhs-title">{post.campaignName}</h4>
                  {tags.length > 0 ? (
                    <div className="pf-xhs-tags">
                      {tags.map((t) => (
                        <span key={t} className="pf-xhs-tag">
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="pf-xhs-author-row">
                    <span
                      className="pf-xhs-avatar"
                      style={{ background: avatarSeed(post.brand) }}
                    >
                      {post.brand.trim().charAt(0).toUpperCase()}
                    </span>
                    <span className="pf-xhs-author-name">{post.brand}</span>
                    <span className="pf-xhs-likes" aria-label={`${metrics.likes} 喜欢`}>
                      <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {formatLikes(Math.round(likesNum))}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
