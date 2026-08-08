"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { SectionHeader } from "@/components/archive/SectionHeader";
import { PRODUCT } from "@/lib/config/product";
import { Trash2, RefreshCw, ArrowLeft, Cloud, HardDrive } from "lucide-react";

const USER_STORE_KEY = "wa_user_store_v1";
const READING_POS_KEY = "wa_reading_positions_v1";

function byteLength(str: string): number {
  return new Blob([str]).size;
}

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [storeSize, setStoreSize] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);
  const [watchCount, setWatchCount] = useState(0);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = window.localStorage.getItem(USER_STORE_KEY) || "{}";
    setStoreSize(byteLength(raw));
    try {
      const data = JSON.parse(raw);
      setFavCount((data.favorites?.length ?? 0) + (data.favoriteItemIds?.length ?? 0));
      setNoteCount(Object.keys(data.notes || {}).length);
      setWatchCount((data.watchlists?.length ?? 0) + (data.watchlistItemIds?.length ?? 0));
    } catch {
      // ignore parse errors
    }
  }, [cleared]);

  const handleClearLocal = () => {
    if (typeof window === "undefined") return;
    if (!confirm("确定清除本机所有用户数据（收藏、笔记、观察名单、阅读进度）？此操作不可恢复。")) {
      return;
    }
    window.localStorage.removeItem(USER_STORE_KEY);
    window.localStorage.removeItem(READING_POS_KEY);
    setCleared(true);
  };

  return (
    <ArchiveShell>
      <div style={{ marginBottom: 18 }}>
        <Link href="/desk" className="issue-no" style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ArrowLeft size={13} />
          返回今日
        </Link>
      </div>

      <SectionHeader eyebrow="Settings" title="设置" />

      <div className="settings-grid">
        {/* 账户与同步 */}
        <section className="settings-card">
          <h2 className="settings-h">账户与同步</h2>
          <div className="settings-row">
            <div className="settings-icon" style={{ background: "var(--color-paper-dark)" }}>
              <Cloud size={18} />
            </div>
            <div className="settings-body">
              <div className="settings-label">数据存储模式</div>
              <div className="settings-desc">
                当前为公开部署版本，用户数据优先保存在本机浏览器；开启 Supabase 云端同步后可在多设备间恢复。
              </div>
            </div>
            <span className="stamp stamp-lav">本地优先</span>
          </div>
          <div className="settings-row">
            <div className="settings-icon" style={{ background: "var(--color-paper-dark)" }}>
              <HardDrive size={18} />
            </div>
            <div className="settings-body">
              <div className="settings-label">本机数据概览</div>
              <div className="settings-desc">
                {mounted
                  ? `收藏 ${favCount} 条 · 笔记 ${noteCount} 条 · 观察名单 ${watchCount} 条 · 约 ${(storeSize / 1024).toFixed(1)} KB`
                  : "读取中…"}
              </div>
            </div>
          </div>
        </section>

        {/* 数据管理 */}
        <section className="settings-card">
          <h2 className="settings-h">数据管理</h2>
          <div className="settings-row">
            <div className="settings-icon" style={{ background: "var(--color-coral-soft)" }}>
              <Trash2 size={18} />
            </div>
            <div className="settings-body">
              <div className="settings-label">清除本机数据</div>
              <div className="settings-desc">清空收藏、笔记、观察名单与阅读进度。云端同步开启后不会删除云端副本。</div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleClearLocal}>
              清除
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-icon" style={{ background: "var(--color-paper-dark)" }}>
              <RefreshCw size={18} />
            </div>
            <div className="settings-body">
              <div className="settings-label">刷新数据</div>
              <div className="settings-desc">情报、案例、公司档案由服务端自动更新；如遇显示延迟，可返回首页重新进入。</div>
            </div>
            <Link href="/desk" className="btn btn-secondary">
              返回首页
            </Link>
          </div>
        </section>

        {/* 关于 */}
        <section className="settings-card">
          <h2 className="settings-h">关于</h2>
          <div className="settings-row">
            <div className="settings-body">
              <div className="settings-label">{PRODUCT.name}</div>
              <div className="settings-desc">{PRODUCT.positioning}</div>
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-body">
              <div className="settings-label">版本</div>
              <div className="settings-desc">Beta Lock-in / Functional Completion</div>
            </div>
          </div>
        </section>
      </div>

      {cleared && (
        <div className="settings-toast" role="status">
          本机数据已清除
        </div>
      )}
    </ArchiveShell>
  );
}
