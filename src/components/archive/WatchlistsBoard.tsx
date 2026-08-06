"use client";

import { useState } from "react";
import { useWatchlists } from "@/lib/use-persistence";

interface PickOpt {
  id: string;
  title: string;
}

export default function WatchlistsBoard({
  signals,
  cases,
  companies,
  sources,
}: {
  signals: PickOpt[];
  cases: PickOpt[];
  companies: PickOpt[];
  sources: PickOpt[];
}) {
  const { watchlists, addList, addItem, removeItem, deleteList } = useWatchlists();
  const [newName, setNewName] = useState("");
  const [active, setActive] = useState<string | null>(null);
  const [kind, setKind] = useState<"signal" | "case" | "company" | "source">("signal");

  const map = { signal: signals, case: cases, company: companies, source: sources };
  const activeList = watchlists.find((w) => w.id === active) ?? watchlists[0];

  function create() {
    if (!newName.trim()) return;
    addList(newName);
    setNewName("");
  }

  return (
    <div className="wl-wrap">
      <header className="src-hero">
        <div className="src-kicker">Watchlists</div>
        <h1 className="src-title">观察名单</h1>
        <p className="src-lead">
          建立你长期关注的品牌、公司、来源与信号清单。数据保存在本机浏览器，可用于面试前快速复盘目标公司与行业动态。
        </p>
      </header>

      <div className="wl-body">
        <div className="wl-col">
          <div className="wl-add">
            <input
              className="tool-input"
              placeholder="新建名单，如「面试目标公司」"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
            />
            <button className="btn-primary" onClick={create}>
              新建
            </button>
          </div>
          <div className="wl-list">
            {watchlists.length === 0 ? (
              <div className="empty-note">还没有名单。先建一个吧。</div>
            ) : (
              watchlists.map((w) => (
                <div
                  key={w.id}
                  className={`wl-row ${activeList?.id === w.id ? "on" : ""}`}
                  onClick={() => setActive(w.id)}
                >
                  <div>
                    <b>{w.name}</b>
                    <span className="wl-count">{w.items.length}</span>
                  </div>
                  <button
                    className="wl-del"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteList(w.id);
                      if (activeList?.id === w.id) setActive(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="wl-col wide">
          {activeList ? (
            <>
              <div className="wl-head">
                <h2>{activeList.name}</h2>
                <span className="lbl-soft">{activeList.items.length} 项</span>
              </div>

              <div className="wl-pick">
                <div className="seg">
                  {(["signal", "case", "company", "source"] as const).map((k) => (
                    <button key={k} className={`seg-btn ${kind === k ? "on" : ""}`} onClick={() => setKind(k)}>
                      {k === "signal" ? "信号" : k === "case" ? "案例" : k === "company" ? "公司" : "来源"}
                    </button>
                  ))}
                </div>
                <select
                  className="tool-input"
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    const opt = map[kind].find((o) => o.id === e.target.value);
                    if (opt)
                      addItem(activeList.id, {
                        type: kind,
                        ref: opt.id,
                        label: opt.title,
                      });
                  }}
                >
                  <option value="">+ 添加 {kind === "signal" ? "信号" : kind === "case" ? "案例" : kind === "company" ? "公司" : "来源"}…</option>
                  {map[kind].map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title.slice(0, 60)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="wl-items">
                {activeList.items.length === 0 ? (
                  <div className="empty-note">名单还是空的，从上方添加观察对象。</div>
                ) : (
                  activeList.items.map((it) => (
                    <div key={`${it.type}_${it.ref}`} className="wl-item">
                      <span className={`stamp stamp-coral`}>{it.type}</span>
                      <span className="wl-item-label">{it.label}</span>
                      <button
                        className="wl-del"
                        onClick={() => removeItem(activeList.id, it.ref, it.type)}
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <div className="empty-note">选择或新建一个名单开始。</div>
          )}
        </div>
      </div>
    </div>
  );
}
