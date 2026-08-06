// 系统化商务英语词卡（静态整理，不依赖运行时抓取）。
// 原则：定义采用通用商业英语共识释义；范例句（sample）为编者撰写、仅作教学示范，
// 不冒充任何特定文章原文，亦不编造文章链接。来源类别标注为通用商业英语语料范畴。

export interface EnglishBrief {
  id: string;
  term: string;
  zh: string;
  definition: string;
  /** 高频句型模板 */
  pattern: string;
  /** 范例句（编者撰写，教学示范） */
  sample: string;
  /** 更专业 / 地道的替换表达 */
  corporateLanguage: string;
  /** 面试场景下的用法 */
  interviewPitch: string;
  /** 来源类别（通用范畴，不指向具体文章） */
  source: string;
}

export const ENGLISH_BRIEFS: EnglishBrief[] = [
  {
    id: "market-penetration",
    term: "Market Penetration",
    zh: "市场渗透率",
    definition:
      "The degree to which a product or service is adopted within a target market, usually expressed as a percentage of the total addressable audience. A core metric for assessing growth headroom.",
    pattern: "We aim to increase market penetration in [segment] by [X]% over the next [period].",
    sample:
      "Our priority this quarter is to deepen market penetration among Gen-Z consumers rather than expanding into new geographies.",
    corporateLanguage:
      "Prefer “penetration rate” / “share of wallet” in board decks; avoid vague “we sell a lot there.”",
    interviewPitch:
      "Use it to frame a 0→1 brand launch: state the current penetration baseline, the gap, and the lever you'd pull (channel, price, awareness).",
    source: "通用商业英语 · HBR / FT 常见",
  },
  {
    id: "brand-equity",
    term: "Brand Equity",
    zh: "品牌资产",
    definition:
      "The commercial value a brand adds to a product beyond its functional attributes — driven by awareness, perceived quality, associations, and loyalty.",
    pattern: "Strong brand equity allows us to [command a premium / withstand price wars / extend into new categories].",
    sample:
      "Because the brand equity is built on trust, we can launch a higher-price tier without eroding the core customer base.",
    corporateLanguage:
      "Say “equity” not “image.” Tie it to measurable outcomes: pricing power, repeat purchase, consideration.",
    interviewPitch:
      "Connect brand equity to P&L: how brand-building today reduces CAC and lifts lifetime value tomorrow.",
    source: "通用商业英语 · HBR / BoF 常见",
  },
  {
    id: "consumer-insight",
    term: "Consumer Insight",
    zh: "消费者洞察",
    definition:
      "A non-obvious, actionable understanding of consumer motivation that explains the 'why' behind behavior and can inform strategy.",
    pattern: "The key insight is that [audience] doesn't want [X] — they want [underlying need Y].",
    sample:
      "The insight was that shoppers weren't avoiding the category because of price; they doubted efficacy, so we led the campaign with proof.",
    corporateLanguage:
      "Distinguish “insight” (the why) from “observation” (the what). Interviewers reward the former.",
    interviewPitch:
      "Walk through one real insight you uncovered and the concrete decision it changed — that's a stronger story than a metric alone.",
    source: "通用商业英语 · 营销战略通用",
  },
  {
    id: "go-to-market",
    term: "Go-to-Market (GTM) Strategy",
    zh: "市场进入 / 上市策略",
    definition:
      "The plan for how a product reaches and wins customers — covering target segment, positioning, pricing, channel, and launch sequencing.",
    pattern: "Our GTM hinges on [channel] as the wedge, then [secondary channel] for scale.",
    sample:
      "For the new serum we ran a content-led GTM on Xiaohongshu before widening to Tmall, using early reviews as social proof.",
    corporateLanguage:
      "Use “wedge” for the initial beachhead; avoid “we'll be on all platforms” which signals lack of focus.",
    interviewPitch:
      "Show you can sequence a launch: a focused wedge, a proof point, then scale — not a simultaneous blast everywhere.",
    source: "通用商业英语 · SaaS / 消费品牌通用",
  },
  {
    id: "value-proposition",
    term: "Value Proposition",
    zh: "价值主张",
    definition:
      "The clear, specific benefit a product delivers to a target customer, and why it is superior to alternatives.",
    pattern: "For [audience], our value proposition is [benefit] without [common trade-off].",
    sample:
      "The value proposition is clinical-grade results at a clean-beauty price point, without the salon visit.",
    corporateLanguage:
      "Frame as “benefit over trade-off,” e.g. “efficacy without irritation,” rather than a feature list.",
    interviewPitch:
      "Be able to state any brand's value proposition in one sentence and defend it against the nearest competitor.",
    source: "通用商业英语 · 战略 / 营销通用",
  },
  {
    id: "omnichannel",
    term: "Omnichannel",
    zh: "全渠道",
    definition:
      "A coordinated customer experience across online, offline, and social touchpoints so the journey is seamless rather than siloed.",
    pattern: "We treat [store / app / social] as one funnel, not separate P&Ls.",
    sample:
      "Omnichannel means a customer can discover on Douyin, research on our app, and repurchase in-store without friction.",
    corporateLanguage:
      "Contrast with “multi-channel” (many siloed channels); “omni” implies integration and shared data.",
    interviewPitch:
      "Cite a concrete integration win (e.g. offline trial → online repurchase tracked via member ID) to show systems thinking.",
    source: "通用商业英语 · 零售 / 电商通用",
  },
  {
    id: "cac",
    term: "CAC (Customer Acquisition Cost)",
    zh: "用户获取成本",
    definition:
      "The fully-loaded cost of acquiring one new paying customer, including media, creative, and attribution overhead.",
    pattern: "We cut CAC by [X]% by shifting spend from [channel A] to [channel B].",
    sample:
      "By reallocating budget to creator-led content, we brought CAC down 30% while holding ROAS steady.",
    corporateLanguage:
      "Always pair CAC with LTV (lifetime value); “CAC only” is a red flag in interviews.",
    interviewPitch:
      "Demonstrate you optimize the CAC:LTV ratio, not CAC in isolation — that's the mature operator's lens.",
    source: "通用商业英语 · 增长 / 电商通用",
  },
  {
    id: "pivot",
    term: "Pivot",
    zh: "转型 / 战略转向",
    definition:
      "A fundamental shift in strategy, target user, or business model in response to evidence that the original plan isn't working.",
    pattern: "We pivoted from [original bet] to [new focus] once the data showed [signal].",
    sample:
      "When retention stalled on the B2C plan, we pivoted the same engine toward B2B wellness clinics.",
    corporateLanguage:
      "Use “pivot” for a real strategic turn; reserve “iterate” / “tweak” for minor changes to avoid overstatement.",
    interviewPitch:
      "Tell a pivot story with the trigger (data), the decision, and the outcome — shows humility and decisiveness.",
    source: "通用商业英语 · 创业 / 战略通用",
  },
  {
    id: "scalability",
    term: "Scalability",
    zh: "可扩展性",
    definition:
      "The ability to grow revenue or impact without a proportional rise in cost or loss of quality.",
    pattern: "The model is scalable because [leverage point] doesn't scale linearly with headcount.",
    sample:
      "The content engine is scalable: one brief feeds ten localized assets through a templated workflow.",
    corporateLanguage:
      "Pair with the constraint you removed (“the bottleneck was X; we automated it”), not just “it can grow.”",
    interviewPitch:
      "When describing a win, explicitly state why it scales — interviewers probe for one-off vs repeatable.",
    source: "通用商业英语 · 运营 / 战略通用",
  },
  {
    id: "stakeholder",
    term: "Stakeholder",
    zh: "利益相关方",
    definition:
      "Any individual or group with a vested interest in an outcome — including customers, partners, internal teams, and investors.",
    pattern: "We aligned [team A] and [team B] around one stakeholder narrative before launch.",
    sample:
      "Before the rebrand we mapped every stakeholder's risk, then sequenced comms so sales wasn't blindsided.",
    corporateLanguage:
      "Use “align stakeholders” / “manage stakeholders” to show cross-functional leadership, not just execution.",
    interviewPitch:
      "Platform-role interviews reward stakeholder-management stories: how you got conflicting teams to one decision.",
    source: "通用商业英语 · 管理 / 平台通用",
  },
];
