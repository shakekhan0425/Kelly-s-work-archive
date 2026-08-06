import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";

export const metadata = { title: "离线 · WORK / Archive" };

export default function OfflinePage() {
  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 32, marginTop: 40, textAlign: "center" }}>
        <div className="eyebrow" style={{ marginBottom: 8 }}>Offline</div>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>当前离线</h1>
        <p className="list-dek" style={{ maxWidth: "46ch", margin: "0 auto 18px" }}>
          你已访问过的页面已缓存，可继续翻阅。恢复网络后将自动加载最新内容。
        </p>
        <Link href="/desk" className="btn btn-primary">返回今日工作台</Link>
      </section>
    </ArchiveShell>
  );
}
