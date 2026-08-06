"use client";

import { useEffect, useState } from "react";
import { useNote } from "@/lib/use-persistence";

export default function NotesPanel({ itemId, itemTitle }: { itemId: string; itemTitle: string }) {
  const { value, set, ready } = useNote(itemId);
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (ready) setDraft(value);
  }, [ready, value]);

  function commit() {
    set(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }

  return (
    <div className="aside-card notes">
      <div className="aside-h">个人笔记</div>
      <textarea
        className="note-area"
        placeholder="记录你的洞察、可复用素材、面试要点…（本机保存）"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
      />
      <span className="aside-hint">
        {saved ? "已保存到本机 ✓" : "仅保存在本机浏览器"}
      </span>
    </div>
  );
}
