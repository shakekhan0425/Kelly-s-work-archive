"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        background: "#f7f4ef",
        color: "#211f1c",
        textAlign: "center",
      }}
    >
      <section style={{ maxWidth: 520 }}>
        <p style={{ letterSpacing: "0.14em", fontSize: 12, color: "#8d2735" }}>WORK / ARCHIVE</p>
        <h1 style={{ fontSize: 28, margin: "8px 0 12px" }}>实时数据暂时不可用</h1>
        <p style={{ lineHeight: 1.7, color: "#665f59" }}>
          数据库正在响应或暂时超时。为避免把旧本地档案误显示成最新资讯，请稍后刷新。
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            border: 0,
            borderRadius: 6,
            padding: "11px 20px",
            background: "#8d2735",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          重新读取实时数据
        </button>
      </section>
    </main>
  );
}
