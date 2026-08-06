import { StubPage } from "@/components/archive/StubPage";

export default function Page() {
  return (
    <StubPage
      eyebrow="Settings"
      title="设置"
      phase="Phase 1"
      description="设置：个人资料、职业档案、偏好与集成。"
      primaryAction={{ href: "/desk", label: "返回今日" }}
    />
  );
}
