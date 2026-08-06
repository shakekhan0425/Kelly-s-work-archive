"use client";

import { useState } from "react";

/** 轻量 Brief 生成器：基于用户输入产出结构化简报骨架（纯本地，不调用 AI）。 */
export default function BriefBuilder() {
  const [title, setTitle] = useState("");
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");
  const [channel, setChannel] = useState("");
  const [copied, setCopied] = useState(false);

  const brief = [
    `项目：${title || "（未命名 Campaign）"}`,
    `目标：${objective || "（例如：提升新品认知度 / 拉动首单转化）"}`,
    `受众：${audience || "（例如：一线城市 20–35 岁成分党女性）"}`,
    `渠道：${channel || "（例如：小红书种草 + 抖音直播 + 天猫收割）"}`,
    "",
    "一、背景与机会",
    "- 行业动向：（从「市场情报」引用 1–2 条真实信号）",
    "- 消费者洞察：（从「商务英语 / 案例库」提炼）",
    "",
    "二、核心信息",
    "- 主主张：",
    "- 支撑点（证据 / 数据 / 背书）：",
    "",
    "三、创意与媒介",
    "- 核心创意idea：",
    "- 内容矩阵：（短视频 / 图文 / 直播 / 社群）",
    "",
    "四、KPI",
    "- 认知：曝光 / 互动率",
    "- 转化：加购 / 成交 / ROI",
  ].join("\n");

  return (
    <div className="tool-card wide">
      <div className="tool-h">
        <span className="tool-name">Brief Builder</span>
        <span className="tool-tag">本地 · 不调用 AI</span>
      </div>
      <div className="tool-body">
        <div className="tool-form">
          <input className="tool-input" placeholder="项目名称" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="tool-input" placeholder="营销目标" value={objective} onChange={(e) => setObjective(e.target.value)} />
          <input className="tool-input" placeholder="目标受众" value={audience} onChange={(e) => setAudience(e.target.value)} />
          <input className="tool-input" placeholder="核心渠道" value={channel} onChange={(e) => setChannel(e.target.value)} />
        </div>
        <textarea className="tool-output" readOnly value={brief} />
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(brief);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "已复制 ✓" : "复制简报骨架"}
        </button>
      </div>
    </div>
  );
}
