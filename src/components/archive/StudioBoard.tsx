"use client";

import { useMemo, useState } from "react";
import { usePortfolio } from "@/lib/use-persistence";

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
  const [tab, setTab] = useState<"brief" | "story" | "portfolio">("brief");
  const { stories, upsert, remove } = usePortfolio();

  return (
    <div className="studio-wrap">
      <header className="src-hero">
        <div className="src-kicker">Creative Studio</div>
        <h1 className="src-title">创意工作室</h1>
        <p className="src-lead">
          基于真实档案（市场情报 / 品牌案例 / 公司研究）的内容创作工具——所有输出都引用真实条目，
          不虚构事实。生成的结构化 Brief、STAR 故事与作品集草稿保存在本机。
        </p>
      </header>

      <div className="tab-bar">
        {([
          ["brief", "内容 Brief 生成器"],
          ["story", "案例 → 面试故事"],
          ["portfolio", `作品集 (${stories.length})`],
        ] as const).map(([k, label]) => (
          <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "brief" ? (
        <BriefBuilder verticals={verticals} signals={signals} />
      ) : null}
      {tab === "story" ? (
        <StoryBuilder cases={cases} companies={companies} onSave={upsert} />
      ) : null}
      {tab === "portfolio" ? <PortfolioList stories={stories} onRemove={remove} /> : null}
    </div>
  );
}

/* ─────────── Tab 1：内容 Brief 生成器 ─────────── */
function BriefBuilder({ verticals, signals }: { verticals: VizVert[]; signals: SigItem[] }) {
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
      lines.push(`- ${s.title}｜来源 ${s.sourceName}${s.brands.length ? `｜品牌 ${s.brands.join("、")}` : ""}`);
      lines.push(`  ${s.url}`);
    });
    const brands = Array.from(new Set(sel.flatMap((s) => s.brands)));
    const topics = Array.from(new Set(sel.flatMap((s) => s.topics)));
    lines.push("");
    lines.push(`## 切入点建议`);
    lines.push(`- 角度：围绕「${topics.slice(0, 3).join("、") || "行业动向"}」展开，用真实信号支撑论点。`);
    lines.push(`- 涉及品牌：${brands.join("、") || "（无）"}`);
    lines.push(`- 受众：关注${verticals.find((v) => v.id === vertical)?.label || "该行业"}的营销 / 品牌从业者。`);
    return lines.join("\n");
  }, [picked, signals, vertical, verticals, objective]);

  function toggle(id: string) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  }

  return (
    <div className="tool-body">
      <div className="tool-form">
        <label className="fld-label">垂直方向</label>
        <select className="tool-input" value={vertical} onChange={(e) => { setVertical(e.target.value); setPicked([]); }}>
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
              <input type="checkbox" checked={picked.includes(s.id)} onChange={() => toggle(s.id)} />
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
  );
}

/* ─────────── Tab 2：案例 → 面试故事 ─────────── */
function StoryBuilder({
  cases,
  companies,
  onSave,
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
}) {
  const [caseId, setCaseId] = useState("");
  const [situation, setSituation] = useState("");
  const [task, setTask] = useState("");
  const [action, setAction] = useState("");
  const [result, setResult] = useState("");
  const [lessons, setLessons] = useState("");
  const [storyId, setStoryId] = useState<string | null>(null);

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
    const id = storyId ?? `ps_${Date.now().toString(36)}`;
    setStoryId(id);
    onSave({
      id,
      title: sel ? `STAR · ${sel.title}` : "未命名故事",
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
          保存到作品集
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
  );
}

/* ─────────── Tab 3：作品集 ─────────── */
function PortfolioList({
  stories,
  onRemove,
}: {
  stories: { id: string; title: string; situation: string; result: string; updatedAt: string }[];
  onRemove: (id: string) => void;
}) {
  if (!stories.length) return <div className="empty-note">还没有保存的故事。用上方「案例 → 面试故事」生成你的第一个 STAR 故事。</div>;
  return (
    <div className="pf-list">
      {stories.map((s) => (
        <div key={s.id} className="pf-card">
          <div className="pf-top">
            <b>{s.title}</b>
            <button className="pf-del" onClick={() => onRemove(s.id)}>
              删除
            </button>
          </div>
          <p className="pf-sit">{s.situation.slice(0, 120) || "（未填）"}</p>
          <p className="pf-res">{s.result.slice(0, 120) || "（未填）"}</p>
          <div className="pf-date">更新：{s.updatedAt.slice(0, 10)}</div>
        </div>
      ))}
    </div>
  );
}
