"use client";

import { useState } from "react";
import { usePortfolio } from "@/lib/use-persistence";

interface CaseOpt {
  id: string;
  title: string;
  brands: string[];
  topics: string[];
  url: string;
}
interface CoOpt {
  id: string;
  name: string;
  category: string;
}

interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  lessons: string;
  refs: string[];
  updatedAt: string;
}

export default function PortfolioBoard({ cases, companies }: { cases: CaseOpt[]; companies: CoOpt[] }) {
  const { stories, upsert, remove } = usePortfolio();
  const [editing, setEditing] = useState<Story | null>(null);
  const [caseId, setCaseId] = useState("");

  function newFromCase(id: string) {
    const c = cases.find((x) => x.id === id);
    if (!c) return;
    setEditing({
      id: `ps_${Date.now().toString(36)}`,
      title: `STAR · ${c.title.slice(0, 40)}`,
      situation: `背景：${c.title}（来源 ${c.url}）`,
      task: `目标：围绕${c.brands.join("、") || c.topics.join("、") || "品牌"}达成…`,
      action: `动作：…`,
      result: `结果：…（用数据说话）`,
      lessons: `沉淀：…`,
      refs: [c.url],
      updatedAt: new Date().toISOString(),
    });
    setCaseId("");
  }

  function save(s: Story) {
    upsert({ ...s, updatedAt: new Date().toISOString() });
    setEditing(null);
  }

  return (
    <div className="pf-wrap">
      <header className="src-hero">
        <div className="src-kicker">Portfolio</div>
        <h1 className="src-title">作品集</h1>
        <p className="src-lead">
          把真实案例与项目经历沉淀成 STAR 故事，用于面试表达与作品集展示。所有草稿保存在本机浏览器。
          公司研究库已收录 {companies.length} 家，可作为「为什么是我们」「My Fit」的论据来源。
        </p>
      </header>

      <div className="pf-add">
        <select className="tool-input" value={caseId} onChange={(e) => newFromCase(e.target.value)}>
          <option value="">+ 从真实案例生成 STAR 故事…</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title.slice(0, 50)}
            </option>
          ))}
        </select>
        <button className="btn-ghost" onClick={() => setEditing({
          id: `ps_${Date.now().toString(36)}`,
          title: "空白 STAR 故事",
          situation: "", task: "", action: "", result: "", lessons: "", refs: [], updatedAt: new Date().toISOString(),
        })}>
          新建空白故事
        </button>
      </div>

      {/* 案例库：真实案例 + 小红书富化案例展示（无需填写即看得见） */}
      <section className="pf-library">
        <div className="pf-lib-head">
          <div>
            <div className="kicker" style={{ color: "var(--color-archive-red)" }}>CASE LIBRARY</div>
            <h2 style={{ fontFamily: "var(--font-serif-cn)", fontSize: 22, margin: "4px 0 0" }}>案例库</h2>
          </div>
          <span className="stamp">{cases.length} 个真实案例</span>
        </div>
        <div className="pf-lib-grid">
          {cases.map((c) => {
            let h = 0;
            for (const char of c.title) h = (h * 31 + char.charCodeAt(0)) % 360;
            const bg = `linear-gradient(135deg, hsl(${h} 36% 44%), hsl(${(h + 30) % 360} 38% 30%))`;
            const initial = (c.brands[0] || c.title).trim().charAt(0).toUpperCase();
            return (
              <article key={c.id} className="pf-lib-card">
                <div className="pf-lib-cover" style={{ background: bg }} aria-hidden="true">
                  <span>{initial}</span>
                </div>
                <div className="pf-lib-body">
                  <div className="pf-lib-brands">
                    {c.brands.slice(0, 3).map((b) => (
                      <span key={b} className="stamp stamp-coral">{b}</span>
                    ))}
                  </div>
                  <h4 className="pf-lib-title">
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noreferrer">{c.title}</a>
                    ) : (
                      c.title
                    )}
                  </h4>
                  <div className="pf-lib-foot">
                    <button className="pf-lib-pick" onClick={() => newFromCase(c.id)}>生成 STAR →</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {editing ? (
        <StarEditor key={editing.id} initial={editing} companies={companies} onSave={save} onCancel={() => setEditing(null)} />
      ) : null}

      {stories.length === 0 && !editing ? (
        <div className="empty-note">还没有我的故事。从上方真实案例快速生成，或点「新建空白故事」。</div>
      ) : null}

      <div className="pf-list">
        {stories.map((s) => (
          <div key={s.id} className="pf-card">
            <div className="pf-top">
              <b>{s.title}</b>
              <div className="pf-actions">
                <button className="pf-edit" onClick={() => setEditing(s)}>
                  编辑
                </button>
                <button className="pf-del" onClick={() => remove(s.id)}>
                  删除
                </button>
              </div>
            </div>
            <p className="pf-sit">{s.situation.slice(0, 100) || "（未填）"}</p>
            <p className="pf-res">{s.result.slice(0, 100) || "（未填）"}</p>
            <div className="pf-date">更新：{s.updatedAt.slice(0, 10)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StarEditor({
  initial,
  companies,
  onSave,
  onCancel,
}: {
  initial: Story;
  companies: CoOpt[];
  onSave: (s: Story) => void;
  onCancel: () => void;
}) {
  const [s, setS] = useState<Story>(initial);
  const set = (k: keyof Story, v: string) => setS((p) => ({ ...p, [k]: v }));
  return (
    <div className="pf-editor">
      <input className="tool-input" value={s.title} onChange={(e) => set("title", e.target.value)} placeholder="故事标题" />
      {(["situation", "task", "action", "result", "lessons"] as const).map((k, i) => (
        <div key={k}>
          <label className="fld-label">{["情境 S", "任务 T", "行动 A", "结果 R", "沉淀 L"][i]}</label>
          <textarea className="tool-input tall" value={s[k]} onChange={(e) => set(k, e.target.value)} />
        </div>
      ))}
      <label className="fld-label">关联公司（My Fit 论据）</label>
      <select className="tool-input" value="" onChange={(e) => e.target.value && set("lessons", s.lessons + `\n[关联 ${companies.find((c) => c.id === e.target.value)?.name}]`)}>
        <option value="">+ 关联公司…</option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="pf-editor-actions">
        <button className="btn-primary" onClick={() => onSave(s)}>
          保存
        </button>
        <button className="btn-ghost" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}
