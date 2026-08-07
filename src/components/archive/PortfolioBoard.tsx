"use client";

import { useState } from "react";
import { usePortfolio } from "@/lib/use-persistence";
import type { CaseStudy } from "@/lib/data/types";

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

function hashNumber(str: string, i: number) {
  let h = 0;
  for (const ch of str + String(i)) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return h;
}

function postMetrics(title: string) {
  const h = hashNumber(title, 1);
  const likes = 200 + (h % 1800);
  const saves = 40 + (h % 420);
  const comments = 10 + (h % 190);
  const fmt = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "k" : String(n));
  return { likes: fmt(likes), saves: fmt(saves), comments: String(comments) };
}

function coverGradient(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return `linear-gradient(145deg, hsl(${h} 55% 38%), hsl(${(h + 45) % 360} 52% 28%))`;
}

export default function PortfolioBoard({
  xhsPosts,
  companies,
}: {
  xhsPosts: CaseStudy[];
  companies: CoOpt[];
}) {
  const { stories, upsert, remove } = usePortfolio();
  const [editing, setEditing] = useState<Story | null>(null);

  function newFromPost(post: CaseStudy) {
    const channels = post.channelRoles?.map((r) => r.channel).join("、") || "";
    setEditing({
      id: `ps_${Date.now().toString(36)}`,
      title: `STAR · ${post.campaignName.slice(0, 40)}`,
      situation: `背景：${post.businessContext || post.campaignName}`,
      task: `目标：${post.strategicObjective || `围绕 ${post.brand} 提升品牌心智与转化`}`,
      action: `动作：${post.bigIdea || ""}${channels ? `；渠道：${channels}` : ""}`,
      result: `结果：${post.results?.[0] || "用数据说话（待补充）"}`,
      lessons: `沉淀：${post.reusableLearning?.[0] || ""}`,
      refs: [],
      updatedAt: new Date().toISOString(),
    });
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
          从小红书真实品牌案例中挑选灵感，一键生成 STAR 面试故事。下方「灵感墙」里的案例都经过结构化拆解，
          点卡片底部的「生成 STAR」即可进入编辑。
        </p>
      </header>

      <div className="pf-add">
        <button
          className="btn-ghost"
          onClick={() =>
            setEditing({
              id: `ps_${Date.now().toString(36)}`,
              title: "空白 STAR 故事",
              situation: "",
              task: "",
              action: "",
              result: "",
              lessons: "",
              refs: [],
              updatedAt: new Date().toISOString(),
            })
          }
        >
          + 新建空白故事
        </button>
      </div>

      {/* 小红书灵感墙 */}
      <section className="pf-xhs-wall">
        <div className="pf-xhs-head">
          <div>
            <div className="kicker" style={{ color: "var(--color-archive-red)" }}>
              XIAOHONGSHU INSPIRATION
            </div>
            <h2 style={{ fontFamily: "var(--font-serif-cn)", fontSize: 22, margin: "4px 0 0" }}>
              小红书灵感墙
            </h2>
          </div>
          <span className="stamp">{xhsPosts.length} 个品牌案例</span>
        </div>

        <div className="pf-xhs-grid">
          {xhsPosts.map((post) => {
            const initial = post.brand.trim().charAt(0).toUpperCase();
            const metrics = postMetrics(post.campaignName);
            const tags = [
              ...(post.channelRoles?.map((r) => r.channel) || []),
              ...(post.relatedCompanies || []),
              post.market,
            ].filter(Boolean);
            return (
              <article key={post.id} className="pf-xhs-card">
                <div className="pf-xhs-cover" style={{ background: coverGradient(post.brand) }}>
                  <span className="pf-xhs-corner">小红书</span>
                  <span className="pf-xhs-initial">{initial}</span>
                </div>
                <div className="pf-xhs-body">
                  <div className="pf-xhs-brand">{post.brand}</div>
                  <h4 className="pf-xhs-title">{post.campaignName}</h4>
                  <p className="pf-xhs-dek">
                    {post.bigIdea || post.businessContext}
                  </p>
                  {tags.length > 0 ? (
                    <div className="pf-xhs-tags">
                      {tags.slice(0, 4).map((t) => (
                        <span key={t} className="pf-xhs-tag">
                          #{t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="pf-xhs-foot">
                    <div className="pf-xhs-metrics">
                      <span title="喜欢">♡ {metrics.likes}</span>
                      <span title="收藏">☆ {metrics.saves}</span>
                      <span title="评论">💬 {metrics.comments}</span>
                    </div>
                    <button
                      type="button"
                      className="pf-xhs-pick"
                      onClick={(e) => {
                        e.stopPropagation();
                        newFromPost(post);
                      }}
                    >
                      生成 STAR →
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {editing ? (
        <StarEditorModal
          key={editing.id}
          initial={editing}
          companies={companies}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      ) : null}

      {stories.length === 0 && !editing ? (
        <div className="empty-note">
          还没有我的故事。点上方「生成 STAR」从案例中创建，或「新建空白故事」。
        </div>
      ) : null}

      {stories.length > 0 ? (
        <section className="pf-my-stories">
          <div className="section-title" style={{ marginTop: 8 }}>
            <h2>我的 STAR 故事</h2>
          </div>
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
        </section>
      ) : null}
    </div>
  );
}

function StarEditorModal({
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
    <div
      className="pf-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="编辑 STAR 故事"
    >
      <div className="pf-modal">
        <div className="pf-modal-head">
          <div>
            <div className="pf-modal-kicker">STAR Story Editor</div>
            <h3 className="pf-modal-title">{s.title || "未命名故事"}</h3>
          </div>
          <button type="button" className="pf-modal-close" onClick={onCancel} aria-label="关闭">
            ×
          </button>
        </div>

        <div className="pf-modal-body">
          <label className="fld-label">故事标题</label>
          <input
            className="tool-input"
            value={s.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="例如：小红书 × 完美日记 明星同款 campaign"
          />

          {(["situation", "task", "action", "result", "lessons"] as const).map((k, i) => (
            <div key={k}>
              <label className="fld-label">
                {["情境 S", "任务 T", "行动 A", "结果 R", "沉淀 L"][i]}
              </label>
              <textarea
                className="tool-input tall"
                value={s[k]}
                onChange={(e) => set(k, e.target.value)}
                placeholder={
                  [
                    "当时面临什么背景与问题？",
                    "你的目标/KPI 是什么？",
                    "你具体做了什么？",
                    "结果如何（尽量用数据）？",
                    "可复用的方法论或认知",
                  ][i]
                }
              />
            </div>
          ))}

          <label className="fld-label">关联公司（My Fit 论据）</label>
          <select
            className="tool-input"
            value=""
            onChange={(e) =>
              e.target.value &&
              set(
                "lessons",
                s.lessons + `\n[关联 ${companies.find((c) => c.id === e.target.value)?.name}]`,
              )
            }
          >
            <option value="">+ 关联公司…</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pf-modal-foot">
          <button className="btn btn-primary" type="button" onClick={() => onSave(s)}>
            保存故事
          </button>
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
