"use client";

import { useState } from "react";

type ShareKind = "signal" | "case" | "english";

interface ShareCardBuilderProps {
  kind: ShareKind;
  title: string;
  summary?: string;
  sourceName: string;
  publishedAt?: string;
  topics?: string[];
  context?: string;
  takeaways?: string[];
  english?: { term: string; sentence: string }[];
}

function clean(value: string | undefined, fallback: string): string {
  const text = value?.replace(/\s+/g, " ").trim();
  return text || fallback;
}

function buildShareText({
  kind,
  title,
  summary,
  sourceName,
  publishedAt,
  topics = [],
  context,
  takeaways = [],
  english = [],
}: ShareCardBuilderProps): string {
  const label = kind === "case" ? "品牌案例" : kind === "english" ? "职场英语" : "市场情报";
  const conclusion = clean(summary, "这条信息值得从工作场景、品牌动作和行业变化三个角度继续观察。");
  const why = clean(context, "把事实放回行业和业务语境，判断它会影响谁、下一步会怎么变化。");
  const insight = takeaways.filter(Boolean).slice(0, 2);
  const terms = english.filter((item) => item.term && item.sentence).slice(0, 2);
  const tags = Array.from(new Set([
    "工作情报",
    kind === "case" ? "品牌案例" : kind === "english" ? "商务英语" : "市场情报",
    ...topics.slice(0, 2),
  ])).map((tag) => `#${tag.replace(/\s+/g, "")}`).join(" ");

  return [
    `【${label}】${title}`,
    "",
    "第 1 页｜一句话结论",
    conclusion,
    "",
    "第 2 页｜发生了什么？",
    why,
    "",
    "第 3 页｜为什么值得关注？",
    ...(insight.length ? insight.map((item) => `· ${item}`) : ["· 关注它对消费者、品牌动作和业务节奏的影响。"]),
    "",
    "第 4 页｜工作中怎么用？",
    kind === "case"
      ? "拆解它的目标、动作和结果，再把可复用的方法迁移到自己的项目。"
      : "先记录事实，再写下自己的判断和下一步要验证的问题。",
    "",
    "第 5 页｜可以顺手学的表达",
    ...(terms.length
      ? terms.map((item) => `${item.term}：${item.sentence}`)
      : ["打开 WORK / Archive 的商务英语模块，按会议、邮件和项目推进场景继续练习。"]),
    "",
    "第 6 页｜来源",
    `来源：${sourceName}${publishedAt ? ` · ${publishedAt}` : ""}`,
    "原始来源与完整上下文见详情页。",
    "",
    tags,
  ].join("\n");
}

async function copyText(text: string): Promise<boolean> {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 继续使用兼容旧浏览器的同步方案。
    }
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "true");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  return copied;
}

export default function ShareCardBuilder(props: ShareCardBuilderProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    setText(buildShareText(props));
    setOpen(true);
    setCopied(false);
  }

  async function copy() {
    const ok = await copyText(text);
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="share-card-builder">
      <button className="share-card-launcher" type="button" onClick={generate}>
        <span>＋</span>
        生成小红书分享卡片
      </button>
      {open ? (
        <div className="share-card-panel">
          <div className="share-card-panel-head">
            <div>
              <span className="share-card-kicker">CONTENT KIT</span>
              <strong>已根据当前真实内容生成</strong>
            </div>
            <button className="share-card-close" type="button" onClick={() => setOpen(false)}>
              收起
            </button>
          </div>
          <textarea
            className="share-card-output"
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-label="小红书分享卡片文案"
          />
          <div className="share-card-foot">
            <span>可编辑后复制到小红书，来源信息已保留。</span>
            <button className="btn btn-primary" type="button" onClick={copy}>
              {copied ? "已复制 ✓" : "复制全部文案"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
