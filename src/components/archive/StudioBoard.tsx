"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFavorites, usePortfolio } from "@/lib/use-persistence";

interface VizVert {
  id: string;
  label: string;
}
interface SigItem {
  id: string;
  title: string;
  sourceName: string;
  vertical: string;
  topics: string[];
  brands: string[];
  summary: string;
  url: string;
}
interface CaseItem {
  id: string;
  title: string;
  sourceName: string;
  brands: string[];
  topics: string[];
  summary: string;
  url: string;
}
interface CoItem {
  id: string;
  name: string;
  category: string;
}

const TOPIC_POOL = [
  "AI如何改变品牌人格",
  "Luxury正在重新定义“稀缺”",
  "为什么品牌重新做线下体验",
  "Creator正在成为品牌本身",
  "短剧营销的下一站在哪里",
  "ESG叙事如何回到产品本身",
];

export default function StudioBoard({
  verticals,
  signals,
  cases,
  companies,
}: {
  verticals: VizVert[];
  signals: SigItem[];
  cases: CaseItem[];
  companies: CoItem[];
}) {
  const [mode, setMode] = useState<"dashboard" | "idea" | "project">("dashboard");
  const { favorites } = useFavorites();
  const { stories, upsert, remove } = usePortfolio();

  const inboxCount = favorites.length;
  const recentSignals = signals.slice(0, 5);
  const recentCases = cases.slice(0, 5);

  return (
    <div className="studio-wrap">
      <header className="studio-head">
        <div>
          <div className="src-kicker">Creative Studio</div>
          <h1 className="src-title">把情报变成想法</h1>
        </div>
        <div className="studio-actions">
          <button className="btn btn-ghost" onClick={() => setMode("idea")}>
            + New Idea
          </button>
          <button className="btn btn-primary" onClick={() => setMode("project")}>
            + New Project
          </button>
        </div>
      </header>

      {mode === "idea" ? (
        <IdeaBuilder
          verticals={verticals}
          signals={signals}
          onClose={() => setMode("dashboard")}
        />
      ) : mode === "project" ? (
        <ProjectBuilder
          cases={cases}
          companies={companies}
          onSave={(s) => {
            upsert(s);
            setMode("dashboard");
          }}
          onClose={() => setMode("dashboard")}
        />
      ) : (
        <>
          <section className="studio-inbox">
            <Link href="/favorites" className="studio-inbox-card">
              <span className="studio-inbox-label">INBOX</span>
              <span className="studio-inbox-title">最近保存的灵感</span>
              <span className="studio-inbox-count">{inboxCount}</span>
            </Link>
          </section>

          <section className="studio-section">
            <h2 className="studio-section-title">TOPIC POOL</h2>
            <div className="studio-topic-pool">
              {TOPIC_POOL.map((t) => (
                <Link
                  key={t}
                  href={`/search?q=${encodeURIComponent(t)}`}
                  className="studio-topic"
                >
                  {t}
                </Link>
              ))}
            </div>
          </section>

          <section className="studio-section">
            <h2 className="studio-section-title">PROJECT BOARDS</h2>
            <div className="studio-boards">
              {stories.length === 0 ? (
                <button
                  className="studio-board studio-board-new"
                  onClick={() => setMode("project")}
                >
                  <span className="studio-board-idx">01</span>
                  <span className="studio-board-name">创建第一个项目</span>
                  <span className="studio-board-meta">0 references · 0 ideas</span>
                </button>
              ) : null}
              {stories.map((s, i) => (
                <div key={s.id} className="studio-board">
                  <span className="studio-board-idx">{String(i + 1).padStart(2, "0")}</span>
                  <span className="studio-board-name">{s.title}</span>
                  <span className="studio-board-meta">{s.refs.length} references · 1 idea</span>
                  <button className="studio-board-del" onClick={() => remove(s.id)}>
                    删除
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="studio-section">
            <RecentInspiration
              signals={recentSignals}
              cases={recentCases}
            />
          </section>
        </>
      )}
    </div>
  );
}

function RecentInspiration({ signals, cases }: { signals: SigItem[]; cases: CaseItem[] }) {
  const [tab, setTab] = useState<"signal" | "case" | "visual" | "podcast" | "note">("signal");

  const items =
    tab === "signal"
      ? signals
      : tab === "case"
      ? cases
      : [];

  return (
    <>
      <h2 className="studio-section-title">RECENT INSPIRATION</h2>
      <div className="studio-tabs">
        {(["signal", "case", "visual", "podcast", "note"] as const).map((k) => (
          <button
            key={k}
            className={`studio-tab ${tab === k ? "on" : ""}`}
            onClick={() => setTab(k)}
          >
            {k[0].toUpperCase() + k.slice(1)}
          </button>
        ))}
      </div>
      <div className="studio-inspiration-list">
        {items.length === 0 ? (
          <div className="empty-note">该分类暂无最近灵感</div>
        ) : null}
        {items.map((it) => {
          const href = "campaignName" in it ? `/cases/${it.id}` : `/signals/${it.id}`;
          return (
            <Link key={it.id} href={href} className="studio-inspiration-row">
              <span className="studio-insp-title">{it.title}</span>
              <span className="studio-insp-src">{it.sourceName}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}

function IdeaBuilder({
  verticals,
  signals,
  onClose,
}: {
  verticals: VizVert[];
  signals: SigItem[];
  onClose: () => void;
}) {
  const [vertical, setVertical] = useState("");
  const [objective, setObjective] = useState("");
  const [picked, setPicked] = useState<string[]>([]);

  const pool = useMemo(
    () => (vertical ? signals.filter((s) => s.vertical === vertical) : signals),
    [vertical, signals],
  );

  const brief = useMemo(() => {
    if (!picked.length) return "";
    const sel = signals.filter((s) => picked.includes(s.id));
    const lines: string[] = [];
    lines.push(`# 内容 Brief`);
    lines.push(`垂直方向：${verticals.find((v) => v.id === vertical)?.label || vertical || "（未选）"}`);
    lines.push(`核心目标：${objective || "（待填写）"}`);
    lines.push("");
    lines.push(`## 可引用的真实信号（${sel.length}）`);
    sel.forEach((s) => {
      lines.push(
        `- ${s.title}｜来源 ${s.sourceName}${s.brands.length ? `｜品牌 ${s.brands.join("、")}` : ""}`,
      );
      lines.push(`  ${s.url}`);
    });
    const brands = Array.from(new Set(sel.flatMap((s) => s.brands)));
    const topics = Array.from(new Set(sel.flatMap((s) => s.topics)));
    lines.push("");
    lines.push(`## 切入点建议`);
    lines.push(
      `- 角度：围绕「${topics.slice(0, 3).join("、") || "行业动向"}」展开，用真实信号支撑论点。`,
    );
    lines.push(`- 涉及品牌：${brands.join("、") || "（无）"}`);
    lines.push(
      `- 受众：关注${verticals.find((v) => v.id === vertical)?.label || "该行业"}的营销 / 品牌从业者。`,
    );
    return lines.join("\n");
  }, [picked, signals, vertical, verticals, objective]);

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="studio-builder">
      <div className="studio-builder-head">
        <h2 className="studio-section-title">New Idea</h2>
        <button className="btn btn-ghost" onClick={onClose}>
          返回看板
        </button>
      </div>
      <div className="tool-body">
        <div className="tool-form">
          <label className="fld-label">垂直方向</label>
          <select
            className="tool-input"
            value={vertical}
            onChange={(e) => {
              setVertical(e.target.value);
              setPicked([]);
            }}
          >
            <option value="">全部行业</option>
            {verticals.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
          <label className="fld-label">核心目标 / 主题</label>
          <input
            className="tool-input"
            placeholder="如：为新品上市策划一轮社媒内容"
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
          />
          <label className="fld-label">选取真实信号（{picked.length}）</label>
          <div className="pick-list">
            {pool.slice(0, 60).map((s) => (
              <label key={s.id} className={`pick ${picked.includes(s.id) ? "on" : ""}`}>
                <input
                  type="checkbox"
                  checked={picked.includes(s.id)}
                  onChange={() => toggle(s.id)}
                />
                <span>{s.title}</span>
              </label>
            ))}
            {pool.length === 0 ? <div className="empty-note">无可用信号</div> : null}
          </div>
        </div>
        <div>
          <label className="fld-label">生成结果（可复制）</label>
          <textarea className="tool-output" readOnly value={brief} placeholder="选择真实信号后自动生成结构化 Brief…" />
        </div>
      </div>
    </div>
  );
}

function ProjectBuilder({
  cases,
  companies,
  onSave,
  onClose,
}: {
  cases: CaseItem[];
  companies: CoItem[];
  onSave: (s: {
    id: string;
    title: string;
    situation: string;
    task: string;
    action: string;
    result: string;
    lessons: string;
    refs: string[];
    updatedAt: string;
  }) => void;
  onClose: () => void;
}) {
  const [caseId, setCaseId] = useState("");
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [lessons, setLessons] = useState("");

  const sel = cases.find((c) => c.id === caseId);

  function loadCase(id: string) {
    const c = cases.find((x) => x.id === id);
    setCaseId(id);
    if (c) {
      setSituation(`背景：${c.summary || c.title}（来源 ${c.sourceName}）`);
      setTask(`目标：围绕${c.brands.join("、") || c.topics.join("、") || "品牌"}达成…`);
      setAction(`动作：结合案例拆解，我主导了…`);
      setResult(`结果：…（用数据说话，待补充）`);
      setLessons(`沉淀：…`);
    }
  }

  function save() {
    onSave({
      id: `ps_${Date.now().toString(36)}`,
      title: sel ? `STAR · ${sel.title}` : "未命名项目",
      situation,
      task,
      action,
      result,
      lessons,
      refs: sel ? [sel.url] : [],
      updatedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="studio-builder">
      <div className="studio-builder-head">
        <h2 className="studio-section-title">New Project</h2>
        <button className="btn btn-ghost" onClick={onClose}>
          返回看板
        </button>
      </div>
      <div className="tool-body">
        <div className="tool-form">
          <label className="fld-label">选择真实案例</label>
          <select className="tool-input" value={caseId} onChange={(e) => loadCase(e.target.value)}>
            <option value="">— 选择 —</option>
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title.slice(0, 48)}
              </option>
            ))}
          </select>
          <label className="fld-label">S — 情境</label>
          <textarea className="tool-input tall" value={situation} onChange={(e) => setSituation(e.target.value)} />
          <label className="fld-label">T — 任务</label>
          <textarea className="tool-input tall" value={task} onChange={(e) => setTask(e.target.value)} />
          <label className="fld-label">A — 行动</label>
          <textarea className="tool-input tall" value={action} onChange={(e) => setAction(e.target.value)} />
          <label className="fld-label">R — 结果</label>
          <textarea className="tool-input tall" value={result} onChange={(e) => setResult(e.target.value)} />
          <label className="fld-label">L — 沉淀</label>
          <textarea className="tool-input tall" value={lessons} onChange={(e) => setLessons(e.target.value)} />
          <button className="btn-primary" onClick={save}>
            保存项目
          </button>
        </div>
        <div>
          <label className="fld-label">预览</label>
          <div className="story-preview">
            {["情境", "任务", "行动", "结果", "沉淀"].map((k, i) => {
              const v = [situation, task, action, result, lessons][i];
              return (
                <div key={k} className="story-line">
                  <b>{k}</b>
                  <p>{v || "—"}</p>
                </div>
              );
            })}
          </div>
          <div className="story-hint">
            引用公司：{companies.length} 家已入库 · 案例来源：{sel?.sourceName ?? "未选"}
          </div>
        </div>
      </div>
    </div>
  );
}
