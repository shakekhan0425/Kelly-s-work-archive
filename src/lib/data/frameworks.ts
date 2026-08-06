/**
 * Marketing Toolkit —— 真实可复用的营销 / 商业框架库。
 * 内容为行业公认的方法论（STP / 4P / Brand Pyramid 等），属领域知识，
 * 非抓取资讯，可直接用于工作与面试。
 */
export type ToolkitCat = 'Framework' | 'Template' | 'Prompt' | 'Research';

export interface ToolkitItem {
  id: string;
  name: string;
  category: ToolkitCat;
  summary: string;
  /** 结构化要点 / 步骤 / 模板字段 / 提示词 */
  points: string[];
  useWhen: string;
}

export const TOOLKIT: ToolkitItem[] = [
  /* ─────────── Framework Library ─────────── */
  {
    id: 'stp',
    name: 'STP 市场细分',
    category: 'Framework',
    summary:
      'Segmentation（细分）、Targeting（目标）、Positioning（定位）是任何品牌战略的底层骨架，先圈定人群再决定说什么。',
    points: [
      'Segmentation：按人口 / 地理 / 行为 / 心理把市场切成可识别的块',
      'Targeting：评估每块规模与匹配度，选定 1–3 个优先人群',
      'Positioning：在目标人群心智中占据一个清晰、差异化、可信的位置',
      '产出：一句话定位陈述（For X who Y, Brand is the Z that A）',
    ],
    useWhen: '启动新品牌 / 新品、复盘定位模糊、准备 brief 前。',
  },
  {
    id: '4p',
    name: '4P 营销组合',
    category: 'Framework',
    summary:
      'Product / Price / Place / Promotion 是检视营销动作是否完整的经典清单，避免只盯投放。',
    points: [
      'Product：核心价值、SKU、包装、服务',
      'Price：定价逻辑、折扣结构、价值感知',
      'Place：渠道组合、分销、线上线下协同',
      'Promotion：内容、KOL、广告、PR、私域',
    ],
    useWhen: '做上市计划、审计现有打法、对比竞品动作。',
  },
  {
    id: 'brand-pyramid',
    name: 'Brand Pyramid 品牌金字塔',
    category: 'Framework',
    summary:
      '从「被知晓」到「被忠诚」，层层递进建立品牌资产，用于诊断品牌与用户关系的深度。',
    points: [
      'Salience 显著性：先被想到',
      'Performance / Imagery 性能与形象：满足功能与情感需求',
      'Judgement / Feelings 评判与感受：理性认可与情感共鸣',
      'Resonance 共鸣：忠诚、依恋、主动 advocacy',
    ],
    useWhen: '评估品牌健康度、规划从认知到忠诚的进阶路径。',
  },
  {
    id: 'consumer-journey',
    name: 'Consumer Journey 消费者旅程',
    category: 'Framework',
    summary:
      '把用户从「无意识到复购」拆成阶段，定位每个触点的目标与内容，避免漏斗断裂。',
    points: [
      'Awareness 认知：种草、话题、搜索占位',
      'Consideration 考量：评测、KOL、线下体验',
      'Purchase 转化：电商、导购、促销钩子',
      'Retention / Advocacy 留存与推荐：私域、会员、UGC',
    ],
    useWhen: '做全链路规划、找流失环节、设计触点矩阵。',
  },

  /* ─────────── Template Library ─────────── */
  {
    id: 'campaign-brief',
    name: 'Campaign Brief 模版',
    category: 'Template',
    summary: '发给内部 / 代理商的标准战役简报，越清晰越好执行。',
    points: [
      'Background 背景：为什么现在做、要解决什么问题',
      'Objective 目标：可量化（认知 +X% / 转化 Y 件）',
      'Target 人群：STP 结论 + 核心洞察',
      'Big Idea 大创意：一句话主张',
      'Channels & Tactics 渠道与打法',
      'KPI & Timeline 指标与时间线',
    ],
    useWhen: '任何战役启动前，作为对齐与验收基准。',
  },
  {
    id: 'kol-brief',
    name: 'KOL Brief 模版',
    category: 'Template',
    summary: '给达人的合作简报，平衡品牌要求与达人风格。',
    points: [
      'Brand & Product 品牌与产品要点（必讲 3 点）',
      'Key Message 核心信息 + 禁用语',
      'Deliverables 交付物：形式 / 数量 / 时长',
      'Tone & Do-not 调性与红线',
      'Hashtag & Link 话题与购买链路',
      'Timeline & Fee 排期与费用',
    ],
    useWhen: '达人投放、种草合作、直播带货前。',
  },
  {
    id: 'competitor-analysis',
    name: 'Competitor Analysis 模版',
    category: 'Template',
    summary: '结构化对比竞品，输出可行动的差距与机会。',
    points: [
      'Who 直接 / 间接竞品清单',
      'Offer 产品、价格、渠道对比',
      'Message 品牌叙事与内容调性',
      'Strength / Weakness 优势劣势',
      'Gap & Opportunity 我方机会点',
    ],
    useWhen: '季度复盘、新品定位、投标与面试案例。',
  },

  /* ─────────── Research Guide ─────────── */
  {
    id: 'company-research-guide',
    name: 'Company Research Guide 公司研究指南',
    category: 'Research',
    summary: '面试 / BD 前快速吃透一家公司的标准路径，本工作台 Company Dossier 即按此结构沉淀。',
    points: [
      'Business Model：靠什么赚钱、营收逻辑',
      'Brand Portfolio：旗下品牌矩阵与层级',
      'China Strategy：中国市场的独特性与打法',
      'Recent Moves：近 1–2 年关键动作',
      'Marketing Cases：可复用的案例',
      'Competitors & Culture：竞争格局与组织文化',
      'Interview Qs：准备 2–3 个有深度的问题',
    ],
    useWhen: '面试前、客户提案前、竞品入坑前。',
  },
  {
    id: 'financial-report-guide',
    name: 'Financial Report Reading Guide 财报读法',
    category: 'Research',
    summary: '读上市公司财报时优先看的指标，避免被标题带节奏。',
    points: [
      'Revenue & Growth：营收与同比增速（分业务 / 分地区）',
      'Gross / Operating Margin：毛利与经营利润率趋势',
      'Guidance：管理层对下季度的指引',
      'Capex & Cash Flow：资本开支与现金流健康度',
      'Segment & Geo：分部与区域表现',
      'Read with caution：一次性损益、汇率、口径调整',
    ],
    useWhen: '看财报新闻、写行业分析、投研入门。',
  },

  /* ─────────── Prompt Library ─────────── */
  {
    id: 'prompt-case',
    name: 'Prompt · 案例拆解',
    category: 'Prompt',
    summary: '把一篇品牌案例拆成可复用结构。',
    points: [
      '角色：你是资深品牌策略总监',
      '输入：粘贴案例正文',
      '要求：按 Challenge / Insight / Big Idea / Execution / Result / Learning 输出',
      '约束：只基于原文事实，不编造数据；缺数据标注「档案未完成」',
    ],
    useWhen: '读完一个案例想沉淀打法时。',
  },
  {
    id: 'prompt-intel',
    name: 'Prompt · 情报萃取',
    category: 'Prompt',
    summary: '从一条资讯生成面试可用的结构化笔记。',
    points: [
      '角色：营销情报分析师',
      '输入：粘贴资讯',
      '输出：一句话摘要 + 行业影响 + 营销启示 + 可讲给面试官的 30 秒观点',
      '约束：事实可核对，主观部分明确标注「我的解读」',
    ],
    useWhen: '积累面试素材、准备 case study。',
  },
  {
    id: 'prompt-company',
    name: 'Prompt · 公司速读',
    category: 'Prompt',
    summary: '面试前 20 分钟吃透一家公司。',
    points: [
      '角色：商业分析师',
      '输入：公司名 + 已知资料',
      '输出：商业模式一句话 + 3 个值得问面试官的问题 + 1 个我方能贡献的点',
      '约束：不编造未公开数据',
    ],
    useWhen: '面试前一晚突击。',
  },
];

export function getToolkitByCategory(cat: ToolkitCat): ToolkitItem[] {
  return TOOLKIT.filter((t) => t.category === cat);
}
