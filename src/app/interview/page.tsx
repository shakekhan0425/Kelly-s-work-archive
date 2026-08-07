import Link from "next/link";
import { ArchiveShell } from "@/components/archive/ArchiveShell";
import { getCompanyDossiers, getEnglish, CATEGORY_LABELS } from "@/lib/data/archive";

export const metadata = { title: "面试题库 · WORK / Archive" };

const BEHAVIORAL = [
  "请讲一个你从 0 到 1 操盘项目的经历（情境 / 任务 / 动作 / 结果）。",
  "你如何用数据衡量一次内容营销活动的成败？",
  "当创意方向与业务 KPI 冲突时，你会怎么取舍？",
  "描述一次跨部门协同中你推动共识的例子。",
  "你做过最「低成本高杠杆」的增长动作是什么？",
  "如果资源减半，你会先砍掉哪部分预算？为什么？",
];

export default function InterviewPage() {
  const dossiers = getCompanyDossiers().filter((d) => d.interviewQuestions.length > 0);
  const english = getEnglish(24);

  return (
    <ArchiveShell>
      <div className="iv-wrap">
        <header className="src-hero">
          <div className="src-kicker">Interview Bank</div>
          <h1 className="src-title">面试题库</h1>
          <p className="src-lead">
            聚合真实公司研究库中的面试题、通用行为题与商务英语表达——全部基于已入库的真实数据，
            可用于字节跳动内容运营 / 行业运营方向的面试准备。
          </p>
        </header>

        <section className="iv-sec">
          <h2 className="iv-h">高频行为题</h2>
          <ul className="iv-list">
            {BEHAVIORAL.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>

        <section className="iv-sec">
          <h2 className="iv-h">按目标公司分类</h2>
          <div className="iv-companies">
            {dossiers.map((d) => (
              <div key={d.id} className="iv-company">
                <div className="iv-company-head">
                  <Link href={`/companies/${d.id}`} className="crumb">
                    {d.name}
                  </Link>
                  <span className="stamp stamp-coral">{CATEGORY_LABELS[d.category]}</span>
                </div>
                <ul className="iv-questions">
                  {d.interviewQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="iv-sec">
          <h2 className="iv-h">商务英语表达（来自真实抓取内容）</h2>
          <div className="en-grid">
            {english.map((e) => (
              <a key={e.id} className="en-card" href={e.url} target="_blank" rel="noreferrer">
                <div className="en-sentence">“{e.sentence}”</div>
                <div className="en-terms">
                  {e.terms.map((t) => (
                    <span key={t} className="stamp stamp-lav">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="en-src">{e.sourceName}</div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </ArchiveShell>
  );
}
