"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

type WxSource = {
  id: string;
  name: string;
  status: string;
  last_checked: string | null;
  last_successful_sync: string | null;
  latest_article_at: string | null;
  articles_imported: number;
  error_message: string | null;
};
type Health = {
  sources_total: number;
  sources_healthy: number;
  articles_total: number;
  articles_published: number;
  articles_processing: number;
  latest_article_at: string | null;
};
type Job = {
  id: string;
  source_id: string;
  job_type: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  items_found: number;
  items_inserted: number;
  items_updated: number;
  error_message: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  connected: "已连接",
  syncing: "同步中",
  healthy: "健康",
  rate_limited: "限流",
  auth_required: "需登录",
  failed: "失败",
  paused: "已暂停",
  pending: "待接入",
};
const STATUS_COLOR: Record<string, { bg: string; fg: string }> = {
  connected: { bg: "#e7f5ff", fg: "#1971c2" },
  syncing: { bg: "#fff4e6", fg: "#e8590c" },
  healthy: { bg: "#ebfbee", fg: "#2f9e44" },
  rate_limited: { bg: "#fff9db", fg: "#f08c00" },
  auth_required: { bg: "#f3f0ff", fg: "#6741d9" },
  failed: { bg: "#fff0f0", fg: "#e03131" },
  paused: { bg: "#f1f3f5", fg: "#868e96" },
  pending: { bg: "#f1f3f5", fg: "#868e96" },
};

function fmt(d: string | null | undefined): string {
  if (!d) return "—";
  const t = new Date(d);
  if (isNaN(t.getTime())) return "—";
  return t.toLocaleString("zh-CN", { hour12: false });
}

export function WechatSourcesPanel() {
  const [sources, setSources] = useState<WxSource[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!URL || !ANON) {
      setErr("Supabase 客户端环境变量未配置（NEXT_PUBLIC_SUPABASE_URL / ANON_KEY）");
      setLoading(false);
      return;
    }
    const sb = createClient(URL, ANON, { auth: { persistSession: false } });
    (async () => {
      try {
        const [sRes, hRes, jRes] = await Promise.all([
          sb.from("wechat_sources_public").select("*").order("name"),
          sb.from("wechat_health").select("*").single(),
          sb
            .from("sync_jobs_public")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(12),
        ]);
        if (sRes.error) throw sRes.error;
        if (hRes.error) throw hRes.error;
        if (jRes.error) throw jRes.error;
        setSources((sRes.data as WxSource[]) || []);
        setHealth((hRes.data as Health) || null);
        setJobs((jRes.data as Job[]) || []);
      } catch (e: any) {
        setErr(String(e?.message || e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return <div style={{ padding: 16, color: "#868e96" }}>读取公众号同步状态…</div>;
  if (err)
    return (
      <div style={{ padding: 16, color: "#e03131" }}>
        无法读取同步状态：{err}
        <div style={{ fontSize: 12, marginTop: 6, color: "#868e96" }}>
          请确认 Supabase 表已建（0003 迁移）且 NEXT_PUBLIC 环境变量已在 Vercel 配置。
        </div>
      </div>
    );

  return (
    <section style={{ marginTop: 28 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
        <h2 style={{ fontSize: 20, margin: 0 }}>微信公众号 · 自动接入</h2>
        <span style={{ fontSize: 13, color: "#868e96" }}>
          Wechat2RSS 私有云 → Supabase Cron（每 8 分钟抓取 / 15 分钟处理）
        </span>
      </div>
      <p style={{ color: "#495057", fontSize: 14, marginTop: 0 }}>
        来源状态由云端调度真实回写，不再显示「待接入」。登录态与订阅保存在 Wechat2RSS 持久卷，
        微信文章经 AI 萃取后发布到 Desk / Signals。
      </p>

      {/* 健康概览 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: 10,
          margin: "12px 0 18px",
        }}
      >
        <Stat label="订阅账号" value={health?.sources_total ?? 0} sub={`健康 ${health?.sources_healthy ?? 0}`} />
        <Stat label="已入库文章" value={health?.articles_total ?? 0} sub={`已发布 ${health?.articles_published ?? 0}`} />
        <Stat label="处理队列" value={health?.articles_processing ?? 0} sub="未发布" />
        <Stat label="最新文章" value={fmt(health?.latest_article_at)} sub="" small />
      </div>

      {/* 账号明细 */}
      <div style={{ overflowX: "auto", border: "1px solid #e9ecef", borderRadius: 10 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8f9fa", textAlign: "left" }}>
              <Th>账号</Th>
              <Th>状态</Th>
              <Th>最近检查</Th>
              <Th>上次成功同步</Th>
              <Th>最新文章</Th>
              <Th>已导入</Th>
              <Th>错误</Th>
            </tr>
          </thead>
          <tbody>
            {sources.map((s) => {
              const c = STATUS_COLOR[s.status] || STATUS_COLOR.pending;
              return (
                <tr key={s.id} style={{ borderTop: "1px solid #f1f3f5" }}>
                  <Td strong>{s.name}</Td>
                  <Td>
                    <span
                      style={{
                        background: c.bg,
                        color: c.fg,
                        padding: "2px 8px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {STATUS_LABEL[s.status] || s.status}
                    </span>
                  </Td>
                  <Td>{fmt(s.last_checked)}</Td>
                  <Td>{fmt(s.last_successful_sync)}</Td>
                  <Td>{fmt(s.latest_article_at)}</Td>
                  <Td>{s.articles_imported}</Td>
                  <Td style={{ color: s.error_message ? "#e03131" : "#868e96" }}>
                    {s.error_message ? s.error_message.slice(0, 40) : "—"}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 最近同步任务 */}
      <h3 style={{ fontSize: 15, margin: "18px 0 8px" }}>最近同步任务</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {jobs.length === 0 && <div style={{ color: "#868e96", fontSize: 13 }}>暂无同步记录（建表后等待首次 Cron 触发）</div>}
        {jobs.map((j) => (
          <div
            key={j.id}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              fontSize: 12,
              color: "#495057",
              background: "#f8f9fa",
              padding: "6px 10px",
              borderRadius: 8,
            }}
          >
            <span style={{ fontWeight: 600 }}>{j.job_type}</span>
            <span style={{ color: j.status === "failed" ? "#e03131" : "#2f9e44" }}>{j.status}</span>
            <span>发现 {j.items_found}</span>
            <span>新增 {j.items_inserted}</span>
            <span>更新 {j.items_updated}</span>
            <span style={{ marginLeft: "auto", color: "#868e96" }}>{fmt(j.started_at)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value, sub, small }: { label: string; value: any; sub?: string; small?: boolean }) {
  return (
    <div style={{ background: "#f8f9fa", borderRadius: 10, padding: "10px 12px" }}>
      <div style={{ fontSize: 12, color: "#868e96" }}>{label}</div>
      <div style={{ fontSize: small ? 13 : 20, fontWeight: 700, color: "#212529", lineHeight: 1.2 }}>
        {value}
      </div>
      {sub ? <div style={{ fontSize: 11, color: "#adb5bd" }}>{sub}</div> : null}
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ padding: "8px 10px", fontWeight: 600, color: "#495057", whiteSpace: "nowrap" }}>{children}</th>;
}
function Td({ children, strong, style }: { children: React.ReactNode; strong?: boolean; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: "8px 10px", fontWeight: strong ? 600 : 400, color: "#212529", ...style }}>{children}</td>
  );
}
