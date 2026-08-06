"use client";

import ItemRow from "@/components/archive/ItemRow";
import type { ArchiveItem } from "@/lib/data/types";

export function SearchExplorer({ results, q }: { results: ArchiveItem[]; q: string }) {
  return (
    <>
      {q ? (
        <p className="list-dek" style={{ marginTop: 10 }}>
          找到 <b>{results.length}</b> 条与「{q}」相关的结果。
        </p>
      ) : null}

      <div className="col-list">
        {results.length > 0 ? (
          results.map((s) => (
            <ItemRow
              key={s.id}
              item={s}
              href={s.category === "案例" ? `/cases/${s.id}` : `/signals/${s.id}`}
            />
          ))
        ) : q ? (
          <p className="list-dek">
            没有匹配结果，换个关键词试试（品牌名 / 话题 / 来源）。
          </p>
        ) : (
          <p className="list-dek">输入关键词开始检索全档案。</p>
        )}
      </div>
    </>
  );
}
