/**
 * 职场商务英语学习库。
 * 内容按真实工作场景组织：表达不是孤立单词，例句也不依赖外部新闻链接。
 */
export interface EnglishPhrase {
  id: string;
  phrase: string;
  meaning: string;
  scenario: string;
  example: string;
  tip: string;
}

export interface EnglishPracticeModule {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  phrases: EnglishPhrase[];
}

export const ENGLISH_PRACTICE_MODULES: EnglishPracticeModule[] = [
  {
    id: "daily-workplace",
    title: "日常沟通",
    subtitle: "Daily Workplace",
    description: "聊天、跟进、提醒和回应同事的自然表达。",
    phrases: [
      { id: "heads-up", phrase: "heads-up", meaning: "提前提醒 / 预警", scenario: "告诉同事即将发生的变化。", example: "Just a heads-up: the client moved the meeting to 3 p.m.", tip: "常放在句首；语气比 warning 轻。" },
      { id: "keep-posted", phrase: "keep me posted", meaning: "有进展请告诉我", scenario: "请对方持续同步，不需要频繁催问。", example: "Keep me posted on the vendor decision and I'll update the plan.", tip: "比 keep me updated 更口语自然。" },
      { id: "touch-base", phrase: "touch base", meaning: "短暂沟通 / 碰一下", scenario: "安排一个短会或快速同步。", example: "Can we touch base tomorrow morning about the launch?​", tip: "常搭配 about / on；不是正式深度会议。" },
      { id: "on-my-radar", phrase: "on my radar", meaning: "我已经注意到", scenario: "回应问题，同时让对方知道你会跟进。", example: "The staffing issue is on my radar; I'll come back with options.", tip: "比 I know 更有行动感。" },
      { id: "works-for-me", phrase: "works for me", meaning: "我可以 / 这样安排没问题", scenario: "确认时间、方案或分工。", example: "Thursday at 10 works for me. I'll send the invite.", tip: "口语常用；正式邮件可写 That works well for me。" },
      { id: "thanks-for-flagging", phrase: "thanks for flagging this", meaning: "谢谢你提醒这个问题", scenario: "回应风险、遗漏或潜在问题。", example: "Thanks for flagging this. I'll check the numbers before we publish.", tip: "比 thanks for telling me 更像职场表达。" },
    ],
  },
  {
    id: "meetings",
    title: "开会与协作",
    subtitle: "Meetings & Collaboration",
    description: "从开场、对齐、打断，到会后行动项。",
    phrases: [
      { id: "meeting-agenda", phrase: "agenda", meaning: "会议议程", scenario: "开会前说明今天要解决什么。", example: "The agenda today is to align on scope, timing, and ownership.", tip: "agenda 不只是日程，也指会议要讨论的事项。" },
      { id: "align-on", phrase: "align on", meaning: "就……达成一致", scenario: "确认目标、口径、优先级或成功标准。", example: "Before we move forward, let's align on the success metrics.", tip: "常见搭配：align on the goal / timeline / priorities。" },
      { id: "jump-in", phrase: "jump in", meaning: "插一句 / 参与讨论", scenario: "礼貌地加入正在进行的讨论。", example: "Can I jump in with one question before we move on?", tip: "比 interrupt 更自然，适合熟悉的团队会议。" },
      { id: "park-this", phrase: "park this", meaning: "先放一放，之后再议", scenario: "避免一个议题占用全部会议时间。", example: "Let's park this and come back to it after we settle the launch date.", tip: "也可说 park this discussion。" },
      { id: "take-offline", phrase: "take this offline", meaning: "会后单独讨论", scenario: "议题只涉及少数人或需要更细的讨论。", example: "Let's take this offline so we can keep the main discussion moving.", tip: "这里的 offline 指另开会、私聊或另建文档。" },
      { id: "action-items", phrase: "action items", meaning: "行动项 / 待办事项", scenario: "会后明确谁在什么时候完成什么。", example: "I'll recap the action items and owners in the follow-up email.", tip: "比 tasks 更强调会议后的责任和截止时间。" },
    ],
  },
  {
    id: "email",
    title: "写邮件",
    subtitle: "Business Email",
    description: "主题、跟进、抄送、附件、请求与结尾的完整表达。",
    phrases: [
      { id: "following-up", phrase: "following up on", meaning: "跟进之前的事项", scenario: "礼貌地追进度或提醒对方回复。", example: "I'm following up on the proposal we discussed last week.", tip: "比直接写 Any update? 更专业。" },
      { id: "looping-in", phrase: "looping you in", meaning: "把你加入沟通", scenario: "抄送相关同事，让对方了解背景或参与决策。", example: "Looping in Mia, who owns the regional rollout.", tip: "常用于邮件开头；不要只抄送而不说明原因。" },
      { id: "for-your-review", phrase: "for your review", meaning: "请你审阅", scenario: "提交方案、合同、预算或文档。", example: "Sharing the revised deck for your review before Friday's meeting.", tip: "比 Please see attached 更具体。" },
      { id: "please-find-attached", phrase: "please find attached", meaning: "请查收附件", scenario: "正式邮件中引出附件。", example: "Please find attached the final budget and implementation timeline.", tip: "更自然的现代写法也可以是 I've attached...。" },
      { id: "at-your-earliest", phrase: "at your earliest convenience", meaning: "方便时尽早", scenario: "请求回复，但不想显得命令式。", example: "Could you confirm the final headcount at your earliest convenience?", tip: "语气偏正式；内部聊天可用 when you have a moment。" },
      { id: "per-our-conversation", phrase: "per our conversation", meaning: "根据我们刚才的讨论", scenario: "把口头结论落到邮件里，形成记录。", example: "Per our conversation, we'll test the new flow with a small user group first.", tip: "也可写 As discussed，语气更自然。" },
    ],
  },
  {
    id: "reporting",
    title: "汇报与演示",
    subtitle: "Reporting & Presentations",
    description: "向老板、客户或跨部门团队讲清数据、判断和下一步。",
    phrases: [
      { id: "walk-through", phrase: "walk you through", meaning: "带你逐步看一遍", scenario: "介绍方案、流程、数据或演示文稿。", example: "I'll walk you through the three options and my recommendation.", tip: "比 explain 更有引导感，适合 presentation。" },
      { id: "key-takeaway", phrase: "key takeaway", meaning: "核心结论", scenario: "汇报结束时帮听众抓住重点。", example: "The key takeaway is that retention improved, but acquisition costs rose.", tip: "不要只报数据，要说这个数据意味着什么。" },
      { id: "top-line", phrase: "top-line", meaning: "顶线 / 收入层面的", scenario: "讨论收入、销售额或整体结果。", example: "The campaign had a positive top-line impact, despite the higher media spend.", tip: "top-line 通常指 revenue；bottom line 通常指利润或最终结果。" },
      { id: "drill-down", phrase: "drill down into", meaning: "向下拆解 / 深挖", scenario: "从总量进入渠道、地区、用户或产品维度。", example: "Let's drill down into the drop-off by customer segment.", tip: "常与 data / numbers / drivers 搭配。" },
      { id: "on-track", phrase: "on track", meaning: "按计划进行", scenario: "汇报项目、目标或预算是否正常。", example: "We're on track to deliver the beta version by the end of the month.", tip: "反义：off track；不要说 on the track。" },
      { id: "next-steps", phrase: "next steps", meaning: "下一步行动", scenario: "汇报结尾把讨论转成执行。", example: "The next steps are to confirm the owner, timeline, and approval path.", tip: "最好同时说 owner 和 date，避免变成空话。" },
    ],
  },
  {
    id: "project",
    title: "项目推进",
    subtitle: "Project Execution",
    description: "启动、排期、风险、依赖和范围控制。",
    phrases: [
      { id: "kick-off", phrase: "kick-off", meaning: "项目启动", scenario: "正式开始一个项目或阶段。", example: "We'll hold a kick-off meeting with all workstream leads next Monday.", tip: "名词写 kick-off；动词写 kick off。" },
      { id: "scope-creep", phrase: "scope creep", meaning: "范围不断膨胀", scenario: "需求越加越多但时间和资源没变。", example: "We need a change-control process to prevent scope creep.", tip: "指出问题后要提出 trade-off，而不是只抱怨。" },
      { id: "dependency", phrase: "dependency", meaning: "依赖项", scenario: "说明一个任务必须等待另一个团队或系统。", example: "The launch date has a dependency on legal approval.", tip: "常用：blocker / dependency / owner 三个词一起梳理。" },
      { id: "unblock", phrase: "unblock", meaning: "解除阻塞", scenario: "项目卡住，需要资源、决策或权限。", example: "I need your decision today to unblock the creative team.", tip: "比 solve the problem 更强调推动项目继续走。" },
      { id: "low-hanging", phrase: "low-hanging fruit", meaning: "容易先实现的成果", scenario: "安排第一阶段快速见效的动作。", example: "Fixing the checkout copy is the low-hanging fruit before a full redesign.", tip: "说优先级时使用，不代表长期价值最高。" },
      { id: "move-the-needle", phrase: "move the needle", meaning: "带来实质变化", scenario: "判断一个动作是否真的影响增长、收入或效率。", example: "The retention experiment moved the needle on repeat purchase.", tip: "通常和具体指标一起说，避免成为空泛黑话。" },
    ],
  },
  {
    id: "cross-functional",
    title: "跨部门与管理",
    subtitle: "Stakeholders & Management",
    description: "责任人、资源、利益相关方和升级处理。",
    phrases: [
      { id: "stakeholder", phrase: "stakeholder", meaning: "利益相关方", scenario: "讨论受项目影响或能影响项目的人。", example: "We need to involve the key stakeholders before changing the pricing model.", tip: "常用搭配：stakeholder alignment / management / mapping。" },
      { id: "buy-in", phrase: "get buy-in", meaning: "争取支持", scenario: "提案落地前获得关键团队认可。", example: "We need to get buy-in from sales before we change the process.", tip: "buy-in 是名词；不要写成 buy ins。" },
      { id: "bandwidth", phrase: "bandwidth", meaning: "时间和精力余量", scenario: "判断团队能否接新任务。", example: "We don't have the bandwidth to add another market this quarter.", tip: "谈的是团队容量，不是网络带宽。" },
      { id: "trade-off", phrase: "trade-off", meaning: "取舍", scenario: "说明无法同时最大化的两个目标。", example: "The trade-off is speed versus customization; we can't maximize both.", tip: "成熟汇报会把 trade-off 讲清楚，而不是只说困难。" },
      { id: "escalate", phrase: "escalate", meaning: "升级处理 / 提请更高层决策", scenario: "问题超出当前权限、影响进度或需要管理层拍板。", example: "If we can't resolve this by noon, I'll escalate it to the steering group.", tip: "升级的是问题或决策，不是为了甩锅。" },
      { id: "single-threaded-owner", phrase: "single-threaded owner", meaning: "单一负责人", scenario: "大厂团队里明确一个人对结果负责。", example: "Let's assign a single-threaded owner so decisions don't get stuck between teams.", tip: "强调一个清晰 owner，不代表一个人做完所有工作。" },
    ],
  },
  {
    id: "feedback-negotiation",
    title: "反馈与谈判",
    subtitle: "Feedback & Negotiation",
    description: "表达不同意见、承接反馈和推动共识。",
    phrases: [
      { id: "hear-you", phrase: "I hear you", meaning: "我理解你的担忧", scenario: "先承接对方观点，再继续讨论。", example: "I hear you on the cost concern. Let's look at the expected payback period.", tip: "不是无条件同意；后面要接事实或方案。" },
      { id: "push-back", phrase: "push back on", meaning: "对……提出异议", scenario: "专业地挑战假设、时间表或方案。", example: "I'd like to push back on the assumption that more traffic will fix retention.", tip: "push back on + 观点；语气比直接说 You're wrong 更好。" },
      { id: "fair-point", phrase: "that's a fair point", meaning: "这个观点有道理", scenario: "承认对方说中了一个事实。", example: "That's a fair point. We should include the operational cost in the model.", tip: "承认一点并不等于接受全部结论。" },
      { id: "where-coming-from", phrase: "I see where you're coming from", meaning: "我理解你为什么这么想", scenario: "跨立场沟通，降低对抗感。", example: "I see where you're coming from, but the current data points in another direction.", tip: "后面接 but 时，要给出具体证据。" },
      { id: "pressure-test", phrase: "pressure-test", meaning: "压力测试 / 反向检验", scenario: "在正式发布前找漏洞、极端情况和反例。", example: "Let's pressure-test the launch plan against a 20% drop in demand.", tip: "比 simply review 更强调主动找问题。" },
      { id: "common-ground", phrase: "find common ground", meaning: "寻找共同点", scenario: "谈判或分歧中先建立共同目标。", example: "We agree on the customer problem; let's find common ground on the rollout pace.", tip: "先共同目标，再谈方案差异。" },
    ],
  },
  {
    id: "acronyms",
    title: "外企与大厂缩写",
    subtitle: "Workplace Acronyms",
    description: "邮件、会议、日历和组织沟通中高频出现的缩写。",
    phrases: [
      { id: "fyi", phrase: "FYI", meaning: "For Your Information · 供参考", scenario: "分享信息，不一定要求对方行动。", example: "FYI, the client has approved the revised timeline.", tip: "不等于命令；需要行动要明确写出来。" },
      { id: "tbd", phrase: "TBD", meaning: "To Be Determined · 待确定", scenario: "细节还没有最终决定。", example: "The venue is TBD, but the event date is confirmed.", tip: "适用于尚未做决定的事项。" },
      { id: "tbc", phrase: "TBC", meaning: "To Be Confirmed · 待确认", scenario: "已有候选结果，但还等确认。", example: "The speaker is TBC pending final approval.", tip: "TBD 是未决定，TBC 是等待确认。" },
      { id: "eod", phrase: "EOD", meaning: "End of Day · 今日下班前", scenario: "明确当天截止时间。", example: "Could you send the final numbers by EOD?", tip: "跨时区团队要写清楚时区。" },
      { id: "eta", phrase: "ETA", meaning: "Estimated Time of Arrival · 预计完成 / 到达时间", scenario: "询问交付、回复或修复何时完成。", example: "What's the ETA for the data refresh?", tip: "职场中常指预计完成时间，不只用于物流。" },
      { id: "asap", phrase: "ASAP", meaning: "As Soon As Possible · 尽快", scenario: "确实紧急时表达优先级。", example: "Please flag any blockers ASAP so we can protect the launch date.", tip: "不要对所有事情都用 ASAP；容易制造虚假紧急感。" },
      { id: "pto", phrase: "PTO", meaning: "Paid Time Off · 带薪休假", scenario: "请假、排班和日历标记。", example: "I'll be on PTO next Friday and will respond on Monday.", tip: "不同公司可能用 vacation leave，但 PTO 在国际团队很常见。" },
      { id: "ooo", phrase: "OOO", meaning: "Out of Office · 不在办公室 / 自动回复", scenario: "邮件自动回复或日历状态。", example: "I'm OOO today with limited access to email.", tip: "邮件里通常补充替代联系人。" },
      { id: "p-and-l", phrase: "P&L", meaning: "Profit and Loss · 损益", scenario: "讨论收入、成本、利润和业务负责范围。", example: "The regional lead owns the P&L for the business.", tip: "写作 P&L，不要写成 PNL。" },
      { id: "kpi", phrase: "KPI", meaning: "Key Performance Indicator · 关键绩效指标", scenario: "衡量岗位、项目或业务是否达标。", example: "The primary KPI is repeat purchase, not traffic alone.", tip: "先说明业务目标，再选 KPI，避免为了指标而指标。" },
      { id: "okr", phrase: "OKR", meaning: "Objectives and Key Results · 目标与关键结果", scenario: "季度或年度目标管理。", example: "Our objective is to improve retention, with three measurable key results.", tip: "Objective 是方向，Key Results 是可验证结果。" },
      { id: "br", phrase: "BR", meaning: "Best Regards · 诚挚问候", scenario: "商务邮件结尾。", example: "BR,\nKelly", tip: "外部正式邮件也可以直接写 Best regards，更稳妥。" },
    ],
  },
  {
    id: "hiring-performance",
    title: "招聘与绩效",
    subtitle: "Hiring & Performance",
    description: "面试、汇报线、岗位和薪酬沟通中的常用表达。",
    phrases: [
      { id: "one-on-one", phrase: "1:1 / one-on-one", meaning: "一对一沟通", scenario: "与直属上级或下属定期沟通。", example: "Let's use our next 1:1 to talk about your development goals.", tip: "1:1 不只聊绩效，也聊障碍、反馈和成长。" },
      { id: "reporting-line", phrase: "reporting line", meaning: "汇报关系", scenario: "说明岗位向谁汇报、团队如何管理。", example: "This role reports into the regional marketing director.", tip: "比 who is your boss 更适合正式沟通。" },
      { id: "headcount", phrase: "headcount", meaning: "编制 / 招聘名额", scenario: "讨论是否能招人或扩充团队。", example: "We have approval for two additional headcount next quarter.", tip: "headcount 可以指人数，也可以指预算中的岗位名额。" },
      { id: "base-variable", phrase: "base and variable", meaning: "固定薪资与浮动薪资", scenario: "招聘或谈 offer 时讨论薪酬结构。", example: "The package includes a competitive base and a performance-based variable.", tip: "对外谈薪时可进一步确认 bonus、equity 和 benefits。" },
      { id: "career-path", phrase: "career path", meaning: "职业发展路径", scenario: "面试、晋升或发展讨论。", example: "I'd like to understand the career path for this role over the next two years.", tip: "比问 Will I get promoted? 更成熟。" },
      { id: "performance-review", phrase: "performance review", meaning: "绩效评估", scenario: "正式评估目标、结果和发展计划。", example: "We'll use the performance review to agree on priorities for the next cycle.", tip: "review 不等于只打分，也包括反馈和下一周期计划。" },
    ],
  },
  {
    id: "marketing-brand",
    title: "营销与品牌工作",
    subtitle: "Marketing & Brand",
    description: "品牌、增长、消费者洞察和商业提案中真正能用的表达。",
    phrases: [
      { id: "gtm", phrase: "go-to-market / GTM", meaning: "市场进入 / 上市策略", scenario: "说明产品怎么定位、定价、分渠道和发布。", example: "Our GTM starts with a focused creator launch before we scale paid media.", tip: "GTM 不是单纯的 launch plan，要包含目标客群和渠道逻辑。" },
      { id: "value-proposition", phrase: "value proposition", meaning: "价值主张", scenario: "一句话说清为谁解决什么问题。", example: "The value proposition is clinical results without the salon visit.", tip: "最好同时说 benefit 和 trade-off。" },
      { id: "positioning", phrase: "positioning", meaning: "定位", scenario: "说明品牌在消费者心智中要占据什么位置。", example: "The new positioning moves the brand from functional to confidence-building.", tip: "定位不是 slogan，而是长期的竞争选择。" },
      { id: "consumer-insight", phrase: "consumer insight", meaning: "消费者洞察", scenario: "解释行为背后的真实动机。", example: "The insight is that shoppers want proof of efficacy, not more product claims.", tip: "insight 要能改变策略，不只是观察到一个现象。" },
      { id: "cac-ltv", phrase: "CAC / LTV", meaning: "获客成本 / 用户终身价值", scenario: "讨论增长是否健康、投放是否值得。", example: "We should optimize the CAC-to-LTV ratio rather than chase cheap traffic.", tip: "不要只报 CAC；必须结合留存和长期价值。" },
      { id: "share-of-voice", phrase: "share of voice", meaning: "品牌声量份额", scenario: "比较品牌在市场传播中的可见度。", example: "Our share of voice grew, but we still need stronger distinctive assets.", tip: "声量增长不等于品牌资产增长，要结合 consideration 和 sales。" },
    ],
  },
];

/** 兼容旧的扁平读取方式；页面使用上面的模块化结构。 */
export const ENGLISH_PRACTICE = ENGLISH_PRACTICE_MODULES.flatMap((module) => module.phrases);
