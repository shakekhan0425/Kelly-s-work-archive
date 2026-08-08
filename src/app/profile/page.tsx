"use client";

import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { useFavorites } from "@/lib/use-persistence";
import { loadLastRead } from "@/lib/reading";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { favorites } = useFavorites();
  const [last, setLast] = useState<ReturnType<typeof loadLastRead>>(null);

  useEffect(() => {
    setLast(loadLastRead());
  }, []);

  return (
    <ArchiveShell>
      <section className="paper-panel" style={{ padding: 22, marginBottom: 20 }}>
        <div className="eyebrow" style={{ marginBottom: 6 }}>Me</div>
        <h1 style={{ fontSize: 30, lineHeight: 1.1 }}>我的工作台</h1>
        <p className="list-dek" style={{ maxWidth: "70ch", marginTop: 8 }}>
          这里汇聚你的收藏与阅读进度，数据已同步到云端，多设备可读。
        </p>

        <div className="profile-grid">
          <Link className="profile-card" href="/favorites">
            <span className="profile-card-t">收藏 {favorites.length}</span>
            <span className="profile-card-d">已保存的情报、案例、播客与公司</span>
          </Link>
          <Link className="profile-card" href="/english">
            <span className="profile-card-t">商务英语</span>
            <span className="profile-card-d">从真实播客与案例萃取表达</span>
          </Link>
          <Link className="profile-card" href="/companies">
            <span className="profile-card-t">关注的品牌</span>
            <span className="profile-card-d">按分类与档位浏览 Company Dossier</span>
          </Link>
        </div>
      </section>

      {last ? (
        <Link href={last.href} className="paper-panel profile-resume">
          <span className="profile-resume-t">继续阅读</span>
          <span className="profile-resume-h">{last.title}</span>
          <span className="profile-resume-p">已读 {Math.round(last.percent * 100)}%</span>
        </Link>
      ) : null}
    </ArchiveShell>
  );
}
