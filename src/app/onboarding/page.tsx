import Link from "next/link";
import { PRODUCT } from "@/lib/config/product";

const STEPS = [
  "选择关注行业",
  "选择地区",
  "选择目标岗位",
  "选择目标公司类型",
  "英语水平与重点",
  "内容偏好",
  "首批观察品牌",
  "导入书签（可跳过）",
];

export default function OnboardingPage() {
  return (
    <div className="page-pad" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="eyebrow">Onboarding</div>
        <h1 style={{ fontSize: 30 }}>欢迎来到 {PRODUCT.name}</h1>
        <p style={{ color: "var(--color-ink-muted)", fontSize: 14 }}>
          八步引导将据此生成你的首期档案。以下为 Phase 0 结构预览。
        </p>
      </div>

      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
        {STEPS.map((s, i) => (
          <li
            key={s}
            className="paper-panel"
            style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 14 }}
          >
            <span
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--color-oxblood)",
                color: "var(--color-paper-light)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
              }}
            >
              {i + 1}
            </span>
            <span style={{ fontFamily: "var(--font-serif-cn)" }}>{s}</span>
            <span className="stamp" style={{ marginLeft: "auto" }}>
              Phase 0 占位
            </span>
          </li>
        ))}
      </ol>

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link href="/desk" className="btn btn-primary">
          进入档案馆 →
        </Link>
      </div>
    </div>
  );
}
