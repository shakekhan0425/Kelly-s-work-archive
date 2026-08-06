import { StubPage } from "@/components/archive/StubPage";

export default function Page() {
  return (
    <StubPage
      eyebrow="Admin"
      title="管理后台"
      phase="Phase 5"
      description="管理后台：抓取任务、AI 任务、来源健康与成本控制。"
      primaryAction={{ href: "/desk", label: "返回今日" }}
    />
  );
}
