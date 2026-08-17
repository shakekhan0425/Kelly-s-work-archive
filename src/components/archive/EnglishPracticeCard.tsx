"use client";

import { useState } from "react";
import type { EnglishPhrase } from "@/lib/data/english.practice";

function practiceText(moduleTitle: string, item: EnglishPhrase): string {
  return [
    `${moduleTitle}｜${item.phrase}`,
    `${item.meaning}`,
    `使用场景：${item.scenario}`,
    `实战例句：${item.example}`,
    `提醒：${item.tip}`,
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

export default function EnglishPracticeCard({
  moduleTitle,
  item,
  compact = false,
}: {
  moduleTitle: string;
  item: EnglishPhrase;
  compact?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const ok = await copyText(practiceText(moduleTitle, item));
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <article className={`en-phrase-card ${compact ? "is-compact" : ""}`}>
      <div className="en-phrase-head">
        <div>
          <div className="en-phrase">{item.phrase}</div>
          <div className="en-phrase-meaning">{item.meaning}</div>
        </div>
        <button className="en-copy-btn" type="button" onClick={copy}>
          {copied ? "已复制 ✓" : "复制实战卡"}
        </button>
      </div>
      {!compact ? <p className="en-phrase-scenario">怎么用：{item.scenario}</p> : null}
      <div className="en-phrase-example">“{item.example}”</div>
      {!compact ? <p className="en-phrase-tip">提醒：{item.tip}</p> : null}
    </article>
  );
}
