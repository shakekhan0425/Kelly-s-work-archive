import type { CompanyDossier } from "../../types";

/**
 * Batch 1 — 全球及中国美妆/个护集团档案（Tier A）
 * 数据截至 2025 财年（部分公司采用 6/30 财年截止，已注明）。
 * updatedAt: 2026-08-06
 */

export const BATCH1: CompanyDossier[] = [
  // 1. L'Oréal 欧莱雅
  {
    id: "loreal",
    name: "L'Oréal",
    aliases: ["欧莱雅", "L'Oréal S.A."],
    category: "Global Beauty & Personal Care",
    tier: "A",
    overview:
      "全球第一大美妆集团，总部巴黎，2025 年营收约 440 亿欧元。四大事业部（大众/高端/皮肤科学/专业美发）覆盖全价格带与全渠道，研发与品牌并购双轮驱动，长期领跑全球美妆市场。",
    timeline: [
      "1909 年 Eugène Schueller 创立，以染发剂起家",
      "1963 年巴黎证券交易所上市",
      "2008 年收购 Sanoflore、The Body Shop（后于 2017 年出售）",
      "2018 年收购 3CE、Logocos",
      "2025 年 10 月以约 40 亿欧元收购 Kering Beauté（含高端香水品牌 Creed）",
    ],
    businessModel:
      "多事业部、多品牌矩阵集团，靠规模化的研发、全球分销与营销中台支撑 4 大事业部。收入来源于护肤/彩妆/香水/护发全品类，高端与皮肤科学事业部贡献主要增长与利润。",
    revenueLogic:
      "营收 = 四大事业部净销售额之和，受高端化、新兴市场渗透率与电商增速驱动；定价能力（LFL 同店增长）是核心利润杠杆。",
    threeYearBaseline: [
      "2025 营收 €44.05B（+4.0% LFL）",
      "2024 营收 €43.49B（+5.6% LFL）",
      "2023 营收 €41.18B（+11.0% LFL）",
    ],
    segmentMix: [
      "Consumer Products 大众化妆品 €16.1B（约 37%）",
      "L'Oréal Luxe 高端化妆品 €15.6B（约 35%）",
      "Dermatological Beauty 皮肤科学美容 €7.2B（约 16%）",
      "Professional Products 专业美发 €5.2B（约 12%）",
    ],
    regionMix: [
      "Europe 欧洲 约 34%",
      "North America 北美 约 27%",
      "North Asia 北亚（含中国）约 23%",
      "SAPMENA / LATAM / Africa 其余约 16%",
    ],
    brandPortfolio: [
      "大众：L'Oréal Paris、Garnier、Maybelline、NYX",
      "高端：Lancôme、YSL、Armani、Kiehl's、Creed（2025 并入）",
      "皮肤科学：La Roche-Posay、Vichy、CeraVe、SkinCeuticals",
      "专业：Redken、Kérastase、Matrix",
    ],
    consumerSegments: [
      "大众价位全年龄护肤/彩妆消费者",
      "高净值人群的高端香水与护肤用户",
      "敏感肌/皮肤屏障修护的医学美容人群",
      "沙龙专业美发人群",
    ],
    channelStrategy: [
      "全渠道：百货专柜、药妆店、电商（含天猫/京东/抖音）、专业沙龙",
      "电商占比持续提升，抖音等中国社交电商为重点增长引擎",
      "高端品牌通过免税与旅游零售触达全球客流",
    ],
    chinaStrategy:
      "中国是北亚核心市场；通过高端事业部（兰蔻/YSL）与皮肤科学（理肤泉/薇姿）双线布局，加码抖音直播与免税渠道，并借收购 Creed 补强高端香水短板。",
    competitorBenchmark: [
      "vs Estée Lauder：欧莱雅多事业部+多价格带更均衡，抗中国高端疲软能力更强",
      "vs P&G/Unilever：欧莱雅更聚焦美妆、高端化与护肤占比高，利润率结构更优",
      "vs Shiseido：欧莱雅全球规模与品牌矩阵远超，中国市场韧性更佳",
    ],
    recentMoves: [
      "2025-10 以约 €4B 收购 Kering Beauté（Creed 等），强化高端香水",
      "增持 Galderma 股份至约 20%，深化皮肤科学赛道卡位",
      "持续加码中国社交电商与 AI 驱动的个性化营销",
    ],
    marketingCases: [
      "'Because You're Worth It / 你值得拥有' 长期品牌主张，全球统一心智",
      "兰蔻/圣罗兰在中国抖音、小红书的明星+达人种草与直播大促",
    ],
    cultureEvidence: [
      "公开强调 'Diversity, Equity & Inclusion' 与 38 个员工资源小组",
      "'Sharing Beauty With All' 可持续发展承诺，可量化减碳/包装目标",
      "研发密度高（年研发费约 €10 亿+），内部晋升与全球轮岗文化",
    ],
    targetRoles: [
      "Brand Manager（事业部品牌管理）",
      "China Digital / E-commerce Lead",
      "Consumer Insights / CRM Manager",
      "Corporate Communications",
    ],
    interviewQuestions: [
      "如何为高端香水品牌（如 Creed）设计进入中国年轻客群的营销打法？",
      "LFL 增长承压时，大众与高端事业部应如何配置营销预算？",
    ],
    myFit:
      "集团品牌矩阵完整、数据驱动营销成熟，适合做品牌管理与社媒增长。中国市场由高端与皮肤科学双线支撑，我可发挥消费者洞察与内容营销经验；但法语总部文化与庞大层级意味着决策链条较长。",
    risks: [
      "中国市场高端消费疲软拖累 Luxe 增速",
      "汇率波动影响以欧元计价的报表",
      "并购整合（Creed/Kering Beauté）执行风险",
    ],
    tradeOffs: [
      "规模与品牌广度 vs 单品牌聚焦深度",
      "高端化利润 vs 大众市场体量增长",
    ],
    sources: [
      "L'Oréal 2025 Annual Results（官网新闻稿）",
      "L'Oréal 2023/2024 年报",
      "Reuters：L'Oréal buys Kering Beauté for €4 bln (Oct 2025)",
    ],
    updatedAt: "2026-08-06",
  },

  // 2. Estée Lauder 雅诗兰黛
  {
    id: "estee-lauder",
    name: "Estée Lauder Companies",
    aliases: ["雅诗兰黛", "ELC", "Estée Lauder"],
    category: "Global Beauty & Personal Care",
    tier: "A",
    overview:
      "美国高端美妆集团，以护肤为核心（雅诗兰黛、La Mer、 Clinique 等）。受中国高端需求疲软与旅游零售去库存拖累，FY2023-2025 营收连续下滑，正通过 'Beauty Reimagined' 重组与新 CEO 推动转型。",
    timeline: [
      "1946 年 Estée Lauder 夫人创立",
      "1995 年纽交所上市",
      "2010 年收购 Smashbox",
      "2016 年收购 Too Faced、BECCA",
      "2019 年收购 Dr. Jart+（主打亚洲）",
      "2025 年 Stéphane de La Faverie 接任 CEO，启动 'Beauty Reimagined'",
    ],
    businessModel:
      "高端品牌矩阵集团，重度依赖护肤与旅游零售/免税。以品牌独立运营+共享全球分销为模式，毛利高但受高端周期与渠道库存影响大。",
    revenueLogic:
      "营收 = 护肤/彩妆/香水/护发各品牌净销售额，核心受中国高端需求、旅游零售补库节奏与高端商场客流驱动。",
    threeYearBaseline: [
      "FY2025 营收 $14.33B（-8% 有机）",
      "FY2024 营收 $15.61B（-3% 有机）",
      "FY2023 营收 $15.91B（-10% 有机）",
    ],
    segmentMix: [
      "Skincare 护肤 约 51%（同比 -12%）",
      "Makeup 彩妆 约 28%（同比 -6%）",
      "Fragrance 香水 约 15%（增长较好）",
      "Hair Care 护发 约 6%（同比 -10%）",
    ],
    regionMix: [
      "Asia/Pacific 亚太（含中国内地、旅游零售）约 35%+",
      "Americas 美洲 约 30%",
      "Europe & Other 欧洲及其他 约 35%",
    ],
    brandPortfolio: [
      "Estée Lauder、La Mer、Clinique、Bobbi Brown",
      "Jo Malone London、Tom Ford Beauty、Kilian Paris（香水）",
      "Dr. Jart+、Origins、Aveda、Le Labo",
    ],
    consumerSegments: [
      "高净值女性高端护肤/抗老用户（La Mer 核心）",
      "免税/旅游零售客流（海南、机场）",
      "高端香水小众香氛爱好者（Le Labo/Jo Malone）",
    ],
    channelStrategy: [
      "高端百货专柜、品牌精品店、旅游零售/免税为主",
      "电商（官网+天猫国际）补充，但依赖线下体验",
      "旅游零售去库存是近两年的核心变量",
    ],
    chinaStrategy:
      "中国内地为其重要市场但连续承压（FY2025 中国内地约 $2.74B，-6%）；强调高端定位与海南免税，受本土品牌崛起与消费降级双重挤压。",
    competitorBenchmark: [
      "vs L'Oréal：ELC 更聚焦高端、护肤占比高，抗周期能力弱于对手的多事业部结构",
      "vs Shiseido：两者都受中国市场拖累，但 ELC 高端定位更集中、波动更大",
      "vs Proya/巨子：中国本土品牌在中端快速抢份额，ELC 需守住高端心智",
    ],
    recentMoves: [
      "新 CEO Stéphane de La Faverie 上任，推动 'Beauty Reimagined' 战略",
      "PRGP 利润恢复计划，裁减 5,800–7,000 个岗位以降本",
      "聚焦护肤与香水增长引擎，收缩表现疲弱品类",
    ],
    marketingCases: [
      "'Beauty Reimagined' 集团级品牌与组织重塑叙事",
      "La Mer 在中国的高端艺术联名与明星代言（如刘亦菲等）",
    ],
    cultureEvidence: [
      "家族控股（Lauder 家族）治理，长期品牌主义文化",
      "'Beauty Reimagined' 强调敏捷、消费者为中心的组织再造",
      "公开 DE&I 与可持续承诺（如可持续采购包装）",
    ],
    targetRoles: [
      "Brand President / GM（单品牌）",
      "Greater China Marketing Director",
      "Travel Retail Marketing Lead",
      "Consumer & Market Insights",
    ],
    interviewQuestions: [
      "在中国高端消费疲软下，如何重振雅诗兰黛品牌增长？",
      "'Beauty Reimagined' 应如何落到营销组织与预算配置？",
    ],
    myFit:
      "高端品牌叙事与品牌管理经验高度匹配其岗位需求，中国市场的破局也是我能贡献的方向。但其连续下滑与重组期的不确定性意味着节奏快、容错低，需要我具备更强的战略落地与跨文化沟通力。",
    risks: [
      "中国高端需求持续疲软",
      "旅游零售库存与去化风险",
      "重组裁员带来的组织动荡与 execution 风险",
    ],
    tradeOffs: [
      "高端定位利润 vs 中端走量抗周期",
      "品牌独立运营灵活性 vs 集团协同效率",
    ],
    sources: [
      "Estée Lauder FY2025 财报（官网）",
      "Reuters / WWD：'Beauty Reimagined' 与 PRGP 裁员报道",
    ],
    updatedAt: "2026-08-06",
  },

  // 3. Shiseido 资生堂
  {
    id: "shiseido",
    name: "Shiseido",
    aliases: ["资生堂", "Shiseido Company, Limited"],
    category: "Global Beauty & Personal Care",
    tier: "A",
    overview:
      "日本最大美妆集团（1872 年创立），以护肤见长。中国市场（含旅游零售）占约 35% 但连续承压，2025 年营收下滑、出现净亏损；新 CEO Kentaro Fujiwara 推动 'Action Plan' 改革与品牌组合优化。",
    timeline: [
      "1872 年福原有信在东京创立资生堂药房",
      "1923 年推出首款化妆品",
      "2010 年收购 Bare Escentuals",
      "2016 年收购 Laura Mercier、Dolce&Gabbana 香水授权",
      "2019 年收购 Drunk Elephant",
      "2025 年新 CEO Kentaro Fujiwara 上任，推进结构改革",
    ],
    businessModel:
      "以日本为研发与品牌源头、全球（尤其亚洲）销售的护肤主导型集团。品牌矩阵覆盖高端（CPB/Shiseido）到大众（Elixir），并重仓中国。",
    revenueLogic:
      "营收 = 日本/中国&旅游零售/其他亚太/美洲/EMEA 各区域净销售额；核心受中国高端护肤需求与旅游零售波动影响。",
    threeYearBaseline: [
      "2025 营收 ¥970.0B（-2.1%；核心营业利润 ¥44.5B +22%）",
      "2024 营收 ¥990.6B（约 -1.8%）",
      "2023 营收 ¥973.0B（约 +8.8%）",
    ],
    segmentMix: [
      "护肤为主（Shiseido/CPB/Elixir/Drunk Elephant 等）",
      "彩妆（NARS、MAQuillAGE）",
      "香水/其他（授权品牌）",
    ],
    regionMix: [
      "China & Travel Retail 中国及旅游零售 ¥342.2B（约 35.3%）",
      "Japan 日本本土 ¥295.3B（约 30.4%）",
      "APAC 其他亚太 约 17%",
      "Americas / EMEA 其余约 17%",
    ],
    brandPortfolio: [
      "Shiseido、Clé de Peau Beauté（CPB）、Elixir（+9% 增长）",
      "NARS、MAQuillAGE、ANESSA",
      "Drunk Elephant（收购后表现走弱）",
    ],
    consumerSegments: [
      "日本与亚洲中高端抗老/美白护肤人群",
      "中国一二线高端护肤消费者",
      "旅游零售免税客流",
    ],
    channelStrategy: [
      "高端百货/专柜、药妆店、旅游零售、电商并行",
      "中国依赖天猫国际与旅游零售，受海南免税波动大",
      "日本本土以药妆与百货双轨稳固",
    ],
    chinaStrategy:
      "中国是最大单一区域但连续下滑；强调高端品牌（CPB/资生堂）与本土化研发，面临本土品牌价格战与消费疲软双重压力。",
    competitorBenchmark: [
      "vs L'Oréal：规模与多事业部抗风险能力明显弱于对手",
      "vs 欧莱雅/雅诗兰黛：高端护肤定位重叠，但中国市场韧性更差",
      "vs Proya/巨子：在中端与功效护肤被中国本土品牌快速追赶",
    ],
    recentMoves: [
      "2025 新 CEO Kentaro Fujiwara 推动 'Action Plan' 重组",
      "优化品牌组合，收缩表现弱的 Drunk Elephant 等",
      "出售/关停非核心业务以聚焦护肤与亚洲",
    ],
    marketingCases: [
      "CPB（肌肤之钥）在中国的高端艺术与明星代言营销",
      "Elixir 抗老系列以'胶原蛋白'科学传播驱动 +9% 增长",
    ],
    cultureEvidence: [
      "强调 'OMOTENASHI'（日式待客）服务文化与匠心研发",
      "'Action Plan' 公开强调敏捷与盈利质量改善",
      "长期可持续承诺（2030 愿景 Reduce/Reuse）",
    ],
    targetRoles: [
      "China GM / Marketing Director",
      "Global/Brand Marketing Manager",
      "Consumer Insights (Asia)",
    ],
    interviewQuestions: [
      "如何扭转资生堂在中国市场的连续下滑？",
      "日本匠心品牌文化如何适配中国年轻消费者的沟通方式？",
    ],
    myFit:
      "我在亚洲市场消费者洞察与内容营销上的经验可助力其中国破局，品牌管理的专业度也契合高端定位。但资生堂正处于改革阵痛与连续亏损期，需要更强的危机扭转能力与对日企文化的适应力。",
    risks: [
      "中国市场需求与旅游零售持续承压",
      "2025 出现净亏损（¥40.7B），盈利修复不确定",
      "日企决策慢、改革执行周期长",
    ],
    tradeOffs: [
      "日本品牌匠心 vs 中国市场速度与性价比",
      "高端聚焦 vs 中端体量防御",
    ],
    sources: [
      "Shiseido 2025 财报（官网 IR）",
      "Shiseido 2023/2024 年报与新闻稿",
      "WWD/Reuters：新 CEO 与 Action Plan 报道",
    ],
    updatedAt: "2026-08-06",
  },

  // 4. P&G 宝洁
  {
    id: "p_and_g",
    name: "Procter & Gamble",
    aliases: ["宝洁", "P&G", "PG"],
    category: "FMCG & Consumer Multinationals",
    tier: "A",
    overview:
      "全球最大 FMCG 集团之一，覆盖美妆、 grooming、家庭护理、婴儿与女性护理。FY2025 营收约 $840 亿，靠提价与高端化（'constructive disruption'）驱动增长。2026 年 1 月新 CEO Shailesh Jejurikar 接任。",
    timeline: [
      "1837 年 William Procter 与 James Gamble 创立",
      "2005 年收购 Gillette",
      "2014–2018 年出售/关停逾 100 个品牌做聚焦",
      "2025 年宣布 CEO Jon Moeller 将卸任",
      "2026-01 新 CEO Shailesh Jejurikar（原 Grooming/ Fabric & Home 负责人）上任",
    ],
    businessModel:
      "多品类、多品牌 FMCG 集团，靠规模化制造、零售渠道话语权与广告投放驱动。美容与 grooming 为其中高毛利板块。",
    revenueLogic:
      "营收 = 十大品类（Beauty、Grooming、Health Care、Fabric & Home Care、Baby/Feminine & Family 等）有机销售之和，核心靠定价、高端SKU与新兴市场渗透率。",
    threeYearBaseline: [
      "FY2026 营收 $87.0B（+3% 有机，预测/指引口径）",
      "FY2025 营收 $84.3B（+2% 有机）",
      "FY2024 营收 $84.0B（+2% 有机）",
    ],
    segmentMix: [
      "Beauty 美妆 $16.0B（+7%）",
      "Grooming 理容 约 $7B",
      "Fabric & Home Care 织物与家居护理 $30.3B",
      "Baby/Feminine & Family 婴儿女性护理 $20.4B",
      "Health Care 健康护理 约 $11B",
    ],
    regionMix: [
      "North America 北美 约 45%",
      "Greater China 大中华区（FY2025 约 -5%）",
      "Asia Pacific / Europe / IMEA 等其余约 50%",
    ],
    brandPortfolio: [
      "美妆/个人：Olay、SK-II、Pantene、Head & Shoulders、Oral-B、Old Spice",
      "家庭：Tide、Gain、Downy、Dawn",
      "婴儿/女性：Pampers、Always、Tampax",
    ],
    consumerSegments: [
      "全人群大众护肤（Olay）与高端抗老（SK-II）",
      "家庭清洁与衣物护理日常用户",
      "母婴与女性护理刚需客群",
    ],
    channelStrategy: [
      "现代零售（商超/电商）、批发、跨境电商（SK-II 中国）",
      "电商与 DTC 占比提升，但极度依赖沃尔玛等大型零售议价",
      "大中华区受本土品牌与消费疲软影响而下滑",
    ],
    chinaStrategy:
      "大中华区 FY2025 约 -5%，SK-II 受日本核污水舆情与本土品牌冲击明显；Olay 通过电商与性价比定位维持基本盘。",
    competitorBenchmark: [
      "vs Unilever：P&G 利润率与定价能力更强，品牌聚焦度更高",
      "vs L'Oréal：P&G 美妆只占小头，护肤（Olay/SK-II）定位中高而非奢侈",
      "vs Proya/巨子：在大众护肤被中国功效品牌价格战挤压",
    ],
    recentMoves: [
      "2026-01 新 CEO Shailesh Jejurikar 上任，强调高端化与生产力",
      "持续剥离非核心品牌，聚焦十大品类",
      "大中华区通过 Olay 电商与产品创新稳份额",
    ],
    marketingCases: [
      "Olay '无惧年龄' 与成分党科学传播（烟酰胺）",
      "SK-II 'Pitera/改写命运' 高端叙事与中国明星代言",
    ],
    cultureEvidence: [
      "'Purpose-inspired' 与员工赋能文化，长期强调内部晋升",
      "可持续承诺（Ambition 2030：减碳/包装/平等）",
      "以数据驱动媒介投放与精准营销（Analytical Orange 能力）",
    ],
    targetRoles: [
      "Brand Manager（Olay/SK-II 等）",
      "Greater China Marketing Lead",
      "Consumer & Market Knowledge (CMK)",
    ],
    interviewQuestions: [
      "SK-II 在中国受舆情冲击，如何做品牌修复与沟通？",
      "P&G 的定价策略与新 CEO 增长议程如何衔接？",
    ],
    myFit:
      "宝洁的品牌管理与消费者研究（CMK）体系成熟，能系统锻炼营销基本功，契合我的职业进阶。但其体量庞大、流程严谨，创新速度偏慢，需要我适应强流程与数据驱动决策文化。",
    risks: [
      "大中华区持续下滑",
      "汇率与大宗商品成本压力",
      "新 CEO 战略切换的执行落地风险",
    ],
    tradeOffs: [
      "规模效率 vs 创新速度",
      "提价利润 vs 销量/份额",
    ],
    sources: [
      "P&G FY2025 10-K 与年报",
      "P&G 官网：新 CEO 任命公告（2025/2026）",
      "Reuters：大中华区业绩报道",
    ],
    updatedAt: "2026-08-06",
  },

  // 5. Unilever 联合利华
  {
    id: "unilever",
    name: "Unilever",
    aliases: ["联合利华"],
    category: "FMCG & Consumer Multinationals",
    tier: "A",
    overview:
      "英荷背景的全球 FMCG 集团，覆盖美妆个护、食品、家庭护理。2025 年完成冰淇淋业务分拆，聚焦 'Beauty & Wellbeing / Personal Care / Home Care / Nutrition / Ice Cream(至2025年末已分拆)'。新 CEO Fernando Fernandez（2024 上任）推动 'Growth Action Plan'。",
    timeline: [
      "1929 年 Lever Brothers 与 Margarine Unie 合并",
      "2010 年收购 Alberto Culver",
      "2016 年收购 Dollar Shave Club",
      "2024 年 Fernando Fernandez 接任 CEO",
      "2025 年末完成 Ice Cream（和路雪等）分拆为独立公司",
    ],
    businessModel:
      "多品类 FMCG 集团，靠品牌组合、零售渠道与新兴市场中产扩张驱动。重组后更聚焦高毛利美妆个护与营养。",
    revenueLogic:
      "营收 = 各业务集团（Beauty & Wellbeing、Personal Care、Home Care、Nutrition、Ice Cream 至分拆前）有机增长之和，核心靠销量与定价平衡。",
    threeYearBaseline: [
      "2025 Turnover €50.5B（reported -3.8%，underlying sales +3.5%；含冰淇淋分拆影响）",
      "2024 Turnover €60.8B（underlying +4.2%）",
      "2023 Turnover €59.6B（underlying +5.2%）",
    ],
    segmentMix: [
      "Beauty & Wellbeing 美妆与健康 €12.8B",
      "Personal Care 个人护理 €13.2B",
      "Home Care 家庭护理 €11.6B",
      "Nutrition 营养（食品）约 €13B",
      "Ice Cream 冰淇淋（2025 年末已分拆）",
    ],
    regionMix: [
      "Asia Pacific 亚太 约 40%+（含印度、中国）",
      "Americas 美洲 约 30%",
      "Europe 欧洲 约 20%+",
      "Africa/中东 其余",
    ],
    brandPortfolio: [
      "美妆个护：Dove、Lux、Pond's、Clear、Sunlight、Axe、Rexona",
      "高端：Hourglass、Paula's Choice、Murad",
      "食品/家清：Knorr、Hellmann's、Omo、Cif",
    ],
    consumerSegments: [
      "全球大众个护（Dove 身体护理核心人群）",
      "新兴市场中产刚需用户",
      "高端美妆小众客群（Hourglass 等）",
    ],
    channelStrategy: [
      "现代零售、传统小店（新兴市场分销网络强）、电商",
      "Dove 等靠情感化品牌传播+全渠道铺货",
      "中国依赖电商与本土化产品",
    ],
    chinaStrategy:
      "中国属亚太重要市场但增长平缓；美妆个护以 Dove/Pond's 等大众定位，面临本土品牌价格战与高端化不足的双重挑战。",
    competitorBenchmark: [
      "vs P&G：联合利华品类更杂、利润率偏低，重组聚焦中",
      "vs L'Oréal：美妆非其绝对核心，高端护肤布局较弱",
      "vs Proya/巨子：在中国大众个护被本土功效品牌挤压份额",
    ],
    recentMoves: [
      "2025 年末完成 Ice Cream 分拆，聚焦核心品类",
      "新 CEO Fernando Fernandez 推 'Growth Action Plan' 提效率",
      "加码高端美妆并购（Hourglass 等）与可持续品牌（Dove 极简）",
    ],
    marketingCases: [
      "Dove 'Real Beauty / 真美无界' 长期 body positivity 品牌运动",
      "中国市场的本土化 KOL 与电商大促打法",
    ],
    cultureEvidence: [
      "'Compass' 价值观与可持续生活使命（Unilever Compass）",
      "强调 'purpose-led brands' 与减塑/气候承诺",
      "Fernandez 上任后强调 'performance culture' 与敏捷",
    ],
    targetRoles: [
      "Brand Manager（Dove/ Pond's 等）",
      "Greater China Marketing",
      "Category / Portfolio Strategy",
    ],
    interviewQuestions: [
      "冰淇淋分拆后，联合利华美妆个护应如何重建增长叙事？",
      "Dove 的 purpose 营销如何在中国市场本地化而不'水土不服'？",
    ],
    myFit:
      "其品牌目的（purpose）营销与新兴市场分销经验能拓宽我的视野，Dove 等品牌管理体系成熟。但集团正处于分拆重组与增长承压期，岗位节奏快、结果导向强，需要我具备更强的品类战略与落地能力。",
    risks: [
      "分拆后增长引擎不明确",
      "新兴市场汇率与通胀压力",
      "中国市场本土竞争与高端化不足",
    ],
    tradeOffs: [
      "品类广度 vs 聚焦效率",
      "品牌目的情怀 vs 短期业绩",
    ],
    sources: [
      "Unilever 2025 Annual Report（官网）",
      "Unilever 2023/2024 年报",
      "Reuters：Ice Cream 分拆与新 CEO 报道",
    ],
    updatedAt: "2026-08-06",
  },

  // 6. Proya 珀莱雅
  {
    id: "proya",
    name: "Proya Cosmetics",
    aliases: ["珀莱雅", "珀莱雅股份", "Proya"],
    category: "China Beauty & Personal Care",
    tier: "A",
    overview:
      "中国本土美妆龙头（2003 年创立，2017 年 A 股上市），以'科学护肤+大单品'策略崛起。主品牌珀莱雅稳居国货护肤前列，第二曲线彩棠（彩妆）、Off&Relax（洗护）高增，创始人侯军呈。",
    timeline: [
      "2003 年侯军呈创立珀莱雅",
      "2017 年上交所主板上市",
      "2019 年推出彩棠（彩妆）",
      "2020 年推 '双抗/红宝石' 大单品系列，抖音爆发",
      "2023 年收购/孵化 Off&Relax、悦芙媞、原色波塔等多品牌",
    ],
    businessModel:
      "多品牌国货美妆集团，以主品牌大单品+社媒种草+自播电商为增长引擎，毛利率高、营销费率高但 ROI 可控。",
    revenueLogic:
      "营收 = 珀莱雅主品牌 + 彩棠 + Off&Relax 等子品牌电商（抖音/天猫）净销售额，靠大单品复购与上新节奏驱动。",
    threeYearBaseline: [
      "2025 营收 ¥105.97亿（-1.68%；归母净利 ¥14.98亿；毛利率 73.26%）",
      "2024 营收 ¥107.78亿（+21.0%；归母净利 ¥15.52亿）",
      "2023 营收 ¥89.05亿（+39.5%）",
    ],
    segmentMix: [
      "护肤（珀莱雅主品牌为主）核心占比",
      "彩妆（彩棠）",
      "洗护（Off&Relax）",
      "其他孵化品牌（悦芙媞/原色波塔/惊时）",
    ],
    regionMix: [
      "中国大陆为主（线上占比高）",
      "东南亚/海外试水（以电商出海为主）",
    ],
    brandPortfolio: [
      "珀莱雅（主品牌）¥76.89亿",
      "彩棠（彩妆）¥12.55亿",
      "Off&Relax（头皮洗护）¥7.44亿（+102%）",
      "悦芙媞、原色波塔、惊时（孵化中）",
    ],
    consumerSegments: [
      "18-35 岁成分党/功效护肤女性",
      "抖音系价格敏感但追新的年轻用户",
      "头皮养护与彩妆进阶人群",
    ],
    channelStrategy: [
      "抖音自播+达人种草为核心，天猫为口碑与复购阵地",
      "大单品策略（双抗/红宝石）提高客单与复购",
      "线下 CS 渠道收缩，重仓线上",
    ],
    chinaStrategy:
      "本土品牌标杆，靠社媒敏捷打法与成分创新在国货中领跑；2025 营收微降系高基数与流量成本上升，仍稳居国货第一梯队。",
    competitorBenchmark: [
      "vs 欧莱雅/雅诗兰黛：性价比+反应速度占优，但品牌溢价与研发厚度弱",
      "vs 巨子/华熙：珀莱雅更偏营销驱动大单品，而非原料/医美壁垒",
      "vs 毛戈平：珀莱雅大众定位，毛戈平高端专业彩妆定位互补",
    ],
    recentMoves: [
      "Off&Relax 洗护翻倍增长，验证多品类延展",
      "2025 营收小幅回落，主动控费提效",
      "持续孵化子品牌（原色波塔/惊时）寻找第三曲线",
    ],
    marketingCases: [
      "'性别不是边界线，偏见才是' 品牌态度营销（女性赋权）",
      "'回声计划' 等公益+成分科普内容营销",
    ],
    cultureEvidence: [
      "高度数据驱动与快反的'互联网化'组织",
      "大单品研发+社媒投放强耦合的作战文化",
      "创始人侯军呈主导战略，决策链路短",
    ],
    targetRoles: [
      "品牌经理（主品牌/子品牌）",
      "社媒/内容营销负责人",
      "消费者洞察/电商运营",
    ],
    interviewQuestions: [
      "2025 营收微降后，珀莱雅的下一个增长曲线在哪里？",
      "如何平衡大单品依赖与品牌长期资产建设？",
    ],
    myFit:
      "我在社媒内容与消费者洞察的经验和其抖音打法高度契合，快节奏、数据导向的文化也匹配我的工作风格。但高营销费率与流量依赖意味着需持续证明 ROI，对创意与复盘能力要求高。",
    risks: [
      "单一主品牌与大单品依赖",
      "流量成本上升、抖音红利见顶",
      "子品牌孵化成功率不确定",
    ],
    tradeOffs: [
      "营销投入换增长 vs 利润质量",
      "大单品聚焦 vs 品牌矩阵分散",
    ],
    sources: [
      "珀莱雅 2025 年报 / 2023-2024 年报（巨潮）",
      "公司公告与券商研报（品牌营收拆分）",
      "公开新闻：营销 campaign 报道",
    ],
    updatedAt: "2026-08-06",
  },

  // 7. Giant Biogene 巨子生物
  {
    id: "giant-biogene",
    name: "Giant Biogene",
    aliases: ["巨子生物", "巨子生物控股", "Giant Biogene Holding"],
    category: "China Beauty & Personal Care",
    tier: "A",
    overview:
      "中国重组胶原蛋白龙头（2000 年依托西北大学技术创立，2022 年港股上市）。以'可复美/可丽金'功效护肤为主，凭借重组胶原蛋白原料与械字号壁垒领跑赛道，范代娣/严建亚夫妇为核心。",
    timeline: [
      "2000 年依托西北大学重组胶原蛋白技术创立",
      "2011 年可丽金品牌上市",
      "2019 年可复美（械字号敷料）放量",
      "2022 年港交所上市",
      "2025 年重组胶原蛋白植入类医疗器械获批",
    ],
    businessModel:
      "研发驱动的功效护肤+医美原料集团，靠重组胶原蛋白专利与'械字号+妆字号'双线变现，直销（DTC/医院）占比高、毛利极高。",
    revenueLogic:
      "营收 = 可复美 + 可丽金 + 其他品牌净销售额，核心靠重组胶原蛋白成分心智、医美渠道与电商放量。",
    threeYearBaseline: [
      "2025 营收 ¥55.19亿（-0.4%；归母净利 ¥19.15亿 -7.2%；毛利率 80.3%）",
      "2024 营收 ¥55.39亿（+57.2%；归母净利 ¥20.62亿）",
      "2023 营收 ¥35.24亿（+49.1%）",
    ],
    segmentMix: [
      "可复美（主品牌）¥44.7亿（约 81%）",
      "可丽金 ¥9.18亿（+9.2%）",
      "其他孵化品牌（欣苷等）",
    ],
    regionMix: [
      "中国大陆为主（线上 DTC + 线下医院/药房）",
      "直销约 74.9% / 经销约 25.1%",
    ],
    brandPortfolio: [
      "可复美（胶原蛋白敷料/护肤，核心）",
      "可丽金（抗老胶原蛋白护肤）",
      "欣苷、参苷（孵化）",
    ],
    consumerSegments: [
      "医美术后修护（械字号刚需人群）",
      "成分党功效护肤女性",
      "抗初老/敏感肌修护人群",
    ],
    channelStrategy: [
      "线上 DTC（天猫/抖音/京东）+ 线下医美机构/药房双轨",
      "直销为主（74.9%），掌控用户与数据",
      "2025 经历'胶原棒'成分争议，加强合规与沟通",
    ],
    chinaStrategy:
      "本土重组胶原蛋白赛道绝对头部，借医美渠道与成分创新建立壁垒；2025 增速放缓系高基数与舆论事件影响，仍居国货功效护肤前列。",
    competitorBenchmark: [
      "vs 华熙生物：巨子以重组胶原蛋白差异化，华熙以透明质酸+多品牌，二者原料路线不同",
      "vs 贝泰妮：巨子偏胶原修护，贝泰妮偏敏感肌，赛道相邻",
      "vs 珀莱雅：巨子研发/原料壁垒更深，但营销声量弱于珀莱雅",
    ],
    recentMoves: [
      "2025 年重组胶原蛋白植入类医疗器械获批，打开医美空间",
      "应对'胶原棒'成分争议，强化研发披露与合规",
      "R&D 投入 ¥0.89亿（费率约 1.6%，同比 -16.6%）",
    ],
    marketingCases: [
      "可复美'胶原棒'次抛精华的成分科普+达人种草打法",
      "医美机构'械字号'专业背书营销",
    ],
    cultureEvidence: [
      "学术/研发基因强（高校成果转化背景）",
      "创始人范代娣为首席科学家的技术权威文化",
      "直销主导带来的用户数据驱动运营",
    ],
    targetRoles: [
      "品牌市场（可复美/可丽金）",
      "医学美妆渠道市场",
      "内容/成分传播",
    ],
    interviewQuestions: [
      "重组胶原蛋白争议后，如何重建消费者信任与品牌沟通？",
      "巨子如何平衡研发壁垒与大众营销声量？",
    ],
    myFit:
      "其研发壁垒与医美渠道属性让我能在'科学传播+专业渠道'方向发挥，成分党沟通也契合我的内容能力。但低营销费率与舆论敏感意味着品牌表达需更克制严谨，对合规意识要求高。",
    risks: [
      "可复美单品牌占比过高（约 81%）",
      "'胶原棒'成分舆论与监管风险",
      "重组胶原蛋白赛道竞争加剧（华熙/创尔等）",
    ],
    tradeOffs: [
      "原料技术壁垒 vs 大众营销声量",
      "直销掌控 vs 渠道覆盖广度",
    ],
    sources: [
      "巨子生物 2025 年报 / 2023-2024 年报（港交所）",
      "公司公告：重组胶原蛋白植入剂获批",
      "公开新闻：胶原棒争议报道",
    ],
    updatedAt: "2026-08-06",
  },

  // 8. Botanee 贝泰妮
  {
    id: "botanee",
    name: "Botanee",
    aliases: ["贝泰妮", "薇诺娜", "Winona", "云南贝泰妮"],
    category: "China Beauty & Personal Care",
    tier: "A",
    overview:
      "中国敏感肌护肤龙头（2010 年成立，2021 年创业板上市），主品牌薇诺娜（Winona）连续多年居国内皮肤学级护肤第一。受行业调整影响 2024-2025 承压，2026 Q1 显复苏。",
    timeline: [
      "2010 年从滇虹药业分拆成立，运营薇诺娜",
      "2014 年薇诺娜在皮肤科渠道建立专业心智",
      "2021 年深交所创业板上市",
      "2022 年推高端抗老品牌 AOXMED 瑷科缦",
      "2026 Q1 营收回暖（约 +17.84%）",
    ],
    businessModel:
      "皮肤学级功效护肤集团，以薇诺娜为核心、医院/药房+电商双渠道，靠敏感肌专业背书与成分（马齿苋/青刺果）建立壁垒。",
    revenueLogic:
      "营收 = 薇诺娜 + AOXMED + Winona Baby 等净销售额，核心靠敏感肌复购与皮肤科学渠道信任。",
    threeYearBaseline: [
      "2025 营收 ¥53.59亿（-6.58%；归母净利 ¥5.06亿；扣费净利 +48.22%；毛利率 74.46%）",
      "2024 营收 ¥57.36亿（+3.9%；归母净利约 ¥5.14亿）",
      "2023 营收 ¥55.22亿（+10.1%）",
    ],
    segmentMix: [
      "薇诺娜（主品牌，敏感肌护肤核心）",
      "AOXMED 瑷科缦（高端抗老，孵化中）",
      "Winona Baby 薇诺娜宝贝（婴童）",
    ],
    regionMix: [
      "中国大陆为主",
      "线上（天猫/抖音）+ 线下药房/皮肤科机构",
    ],
    brandPortfolio: [
      "薇诺娜 Winona（敏感肌第一）",
      "AOXMED 瑷科缦（高端抗老）",
      "Winona Baby（婴童护肤）",
    ],
    consumerSegments: [
      "敏感肌/屏障受损人群（核心）",
      "皮肤科术后修护用户",
      "母婴敏感肌护理人群",
    ],
    channelStrategy: [
      "线下药房/医院皮肤科室专业背书起家，线上电商承接复购",
      "抖音/天猫双线，达人种草+自播",
      "2025 承压后优化投放效率，2026 Q1 复苏",
    ],
    chinaStrategy:
      "本土敏感肌绝对头部（连续 5 年第一），专业渠道信任壁垒深；2025 受行业价格战与流量成本影响下滑，2026 Q1 现拐点。",
    competitorBenchmark: [
      "vs 巨子生物：贝泰妮偏敏感肌、巨子偏胶原，赛道相邻但成分路线不同",
      "vs 欧莱雅（理肤泉/薇姿）：专业背书相似，贝泰妮更本土化、性价比高",
      "vs 珀莱雅：贝泰妮人群更垂直（敏感肌），规模略小但心智强",
    ],
    recentMoves: [
      "2026 Q1 营收反弹（约 +17.84%），释放复苏信号",
      "推进 AOXMED 高端化与第二曲线",
      "优化营销费率、提升投放 ROI",
    ],
    marketingCases: [
      "薇诺娜'敏感肌修护'皮肤科专家背书+成分科普",
      "618/双11 敏感肌品类霸榜营销",
    ],
    cultureEvidence: [
      "皮肤科学导向的研发与医学沟通文化",
      "云南植物成分（马齿苋）地域研发特色",
      "专业渠道起家的'医生信任'基因",
    ],
    targetRoles: [
      "品牌市场（薇诺娜）",
      "医学/专业渠道市场",
      "内容/成分传播",
    ],
    interviewQuestions: [
      "薇诺娜如何在价格战中守住敏感肌第一心智？",
      "AOXMED 高端化破局的关键打法是什么？",
    ],
    myFit:
      "其皮肤科学背书与专业渠道属性让我能发挥'科学传播+垂直人群'的营销专长，垂类心智也契合我擅长的深耕打法。但公司处于复苏拐点，需要更强的效率导向与品类延展能力。",
    risks: [
      "薇诺娜单品牌依赖",
      "敏感肌赛道竞争加剧（国际+本土）",
      "高端化（AOXMED）进展不确定",
    ],
    tradeOffs: [
      "专业垂直心智 vs 品类延展",
      "线下专业渠道 vs 线上规模",
    ],
    sources: [
      "贝泰妮 2025 年报 / 2023-2024 年报（巨潮）",
      "公司 2026 Q1 业绩公告",
      "券商研报：敏感肌赛道排名",
    ],
    updatedAt: "2026-08-06",
  },

  // 9. Bloomage 华熙生物
  {
    id: "bloomage",
    name: "Bloomage Biotech",
    aliases: ["华熙生物", "Bloomage", "Bloomage Biotech"],
    category: "China Beauty & Personal Care",
    tier: "A",
    overview:
      "全球透明质酸（玻尿酸）原料与终端龙头（2000 年成立，2019 年科创板上市）。业务横跨原料、医疗终端、功能性护肤（润百颜/夸迪等）。2023-2024 经历护肤板块调整，2025 营收下滑但净利回升，创始人赵燕回归主导改革。",
    timeline: [
      "2000 年赵燕主导创立，聚焦透明质酸",
      "2008 年港股上市（后私有化）",
      "2019 年科创板上市",
      "2020-2021 年功能性护肤（润百颜/夸迪）爆发",
      "2024-2025 护肤板块调整，赵燕回归重整",
    ],
    businessModel:
      "'原料+医疗+护肤'三轮驱动，以透明质酸全产业链技术为核心，向下游终端（医美/护肤）变现，强研发但终端竞争加剧。",
    revenueLogic:
      "营收 = 原料 + 医疗终端 + 功能性护肤（皮肤科学）净销售额，核心受医美政策、护肤大单品与原料出口影响。",
    threeYearBaseline: [
      "2025 营收 ¥41.99亿（-21.82%；归母净利 ¥2.92亿 +67.59%；毛利率 70.33%）",
      "2024 营收 ¥53.71亿（-11.6%；归母净利约 ¥1.74亿）",
      "2023 营收 ¥60.76亿（-4.4%）",
    ],
    segmentMix: [
      "Skin Science 功能性护肤 ¥14.87亿（-42%，调整中）",
      "Medical 医疗终端 ¥13.69亿（医美/器械）",
      "Raw Materials 原料 ¥12.10亿（HA 出口）",
      "Nutrition 营养 ¥1.08亿",
    ],
    regionMix: [
      "中国大陆为主，原料出口全球",
      "医疗终端受医美监管影响大",
    ],
    brandPortfolio: [
      "润百颜（玻尿酸护肤/医美）",
      "夸迪（高机能护肤）",
      "米蓓尔、BM 肌活（年轻/功效线）",
    ],
    consumerSegments: [
      "玻尿酸成分党女性",
      "医美/轻医美术后人群",
      "原料 B 端客户（全球化妆品企业）",
    ],
    channelStrategy: [
      "原料 B2B 出口 + 医疗终端（机构）+ 功能性护肤电商三线",
      "护肤曾重度依赖大单品与达人，2024 起主动降库存",
      "赵燕回归后强调'回归科技与长期主义'",
    ],
    chinaStrategy:
      "本土玻尿酸全产业链龙头，但护肤板块 2023-2025 连续调整；凭借原料技术壁垒与医疗终端稳住基本盘，护肤待修复。",
    competitorBenchmark: [
      "vs 巨子生物：华熙以 HA 原料广度见长，巨子以重组胶原差异化，终端打法不同",
      "vs 贝泰妮：华熙偏成分（玻尿酸）全场景，贝泰妮偏敏感肌垂直",
      "vs 欧莱雅：原料供应商 vs 品牌商，华熙正向品牌化艰难转型",
    ],
    recentMoves: [
      "创始人赵燕回归，主导组织与战略重整",
      "R&D 投入 ¥4.72亿（费率约 11.24%），维持高研发",
      "主动去护肤库存、收缩低效 SKU",
    ],
    marketingCases: [
      "润百颜'玻尿酸'次抛精华的成分科普营销",
      "夸迪'硬核成分'达人种草打法（调整期前）",
    ],
    cultureEvidence: [
      "强研发/科技导向（科学家文化，赵燕主导）",
      "'重返科技'的改革叙事与长期主义口号",
      "原料基因带来的 B 端严谨与 C 端探索并存",
    ],
    targetRoles: [
      "品牌市场（润百颜/夸迪）",
      "医美/医疗终端市场",
      "原料业务市场（B2B）",
    ],
    interviewQuestions: [
      "华熙护肤板块连续下滑，品牌化破局的关键是什么？",
      "如何在'科技基因'与'消费者沟通'间找到平衡？",
    ],
    myFit:
      "其'科技+成分'属性让我能发挥科学传播与品牌叙事能力，原料到终端的全链视野也有学习价值。但公司正处于战略重整与业绩低谷，需要更强的变革推动力与在不确定性中落地的韧性。",
    risks: [
      "功能性护肤持续下滑",
      "医美监管政策波动",
      "多品牌协同与组织重整执行风险",
    ],
    tradeOffs: [
      "原料技术深度 vs 品牌化投入",
      "全品类布局 vs 聚焦效率",
    ],
    sources: [
      "华熙生物 2025 年报 / 2023-2024 年报（上交所）",
      "公司公告：赵燕回归与改革",
      "券商研报：分板块营收拆分",
    ],
    updatedAt: "2026-08-06",
  },

  // 10. MAOGEPING 毛戈平
  {
    id: "maogeping",
    name: "MAOGEPING Cosmetics",
    aliases: ["毛戈平", "MGP", "MAOGEPING", "毛戈平化妆品"],
    category: "China Beauty & Personal Care",
    tier: "A",
    overview:
      "中国高端专业彩妆标杆（2000 年由化妆师毛戈平创立，2024 年 12 月港交所上市）。以'大师专业+中式美学'高端定位，线上线下均衡，增长强劲，创始人 IP 与培训学校构成独特壁垒。",
    timeline: [
      "2000 年化妆师毛戈平创立品牌",
      "2008 年开设毛戈平形象设计艺术学校",
      "2019 年高端化与百货专柜扩张",
      "2024-12 港交所上市",
      "2025-10 香港海港城旗舰店开业，携手 L Catterton",
    ],
    businessModel:
      "高端专业彩妆集团，靠创始人 IP、专业培训体系与百货专柜体验驱动溢价，线上（占比快速提升）与线下均衡。",
    revenueLogic:
      "营收 = 彩妆 + 护肤（2025 占比约 59.3% / 37.1%）净销售额，核心靠高端定位溢价、专柜体验与电商放量。",
    threeYearBaseline: [
      "2025 营收 ¥50.50亿（+30.01%；归母净利 ¥12.05亿 +36.8%；毛利率 84.22%）",
      "2024 营收 ¥38.85亿（+34.6%；归母净利约 ¥8.81亿）",
      "2023 营收 ¥28.86亿（+57.8%）",
    ],
    segmentMix: [
      "彩妆 约 59.3%（核心，大师系列）",
      "护肤 约 37.1%（高毛利第二曲线）",
      "其他（培训/工具）约 3.6%",
    ],
    regionMix: [
      "中国大陆为主（445 家专柜 + 电商）",
      "线上约 50.5% / 线下约 49.5%（均衡）",
      "2025-10 开香港旗舰店，试水海外",
    ],
    brandPortfolio: [
      "MAOGEPING 毛戈平（主品牌，高端专业彩妆）",
      "至爱终生（副线）",
      "毛戈平形象设计艺术学校（培训生态）",
    ],
    consumerSegments: [
      "追求中式美学与专业妆效的高净值女性",
      "婚嫁/重要场合专业化妆需求人群",
      "粉丝经济驱动的年轻彩妆进阶用户",
    ],
    channelStrategy: [
      "高端百货专柜（体验+服务）为核心线下阵地",
      "线上（天猫/抖音）占比升至约 50.5%，自播+达人",
      "培训学校赋能专业口碑与人才生态",
    ],
    chinaStrategy:
      "本土高端彩妆稀缺标的，借创始人 IP 与专业壁垒避开国际品牌价格战；2025 高速增长并出海（香港店+L Catterton 合作）。",
    competitorBenchmark: [
      "vs 雅诗兰黛/欧莱雅彩妆：MGP 以'中式专业大师'差异化，溢价与增速更优",
      "vs 珀莱雅/彩棠：MGP 高端定位，珀莱雅大众，客群与价格带互补",
      "vs 花西子：MGP 更偏专业高端，花西子偏国风大众",
    ],
    recentMoves: [
      "2025-10 香港海港城旗舰店开业，启动出海",
      "携手 L Catterton 强化资本与全球资源",
      "护肤线（37.1%）快速放量，平衡品类结构",
    ],
    marketingCases: [
      "毛戈平本人'换头妆容'大师 IP 内容与抖音爆款传播",
      "'中式美学'高端品牌大片与明星/达人种草",
    ],
    cultureEvidence: [
      "创始人 IP 与'匠人精神'贯穿品牌",
      "培训学校构建专业人才与口碑生态",
      "高端体验式零售文化（专柜服务）",
    ],
    targetRoles: [
      "品牌市场（MAOGEPING）",
      "高端零售/体验营销",
      "电商/会员运营（6.4M 会员）",
    ],
    interviewQuestions: [
      "MAOGEPING 出海（香港/L Catterton）应如何做品牌本地化？",
      "如何在保持大师 IP 的同时，降低创始人依赖风险？",
    ],
    myFit:
      "其高端定位、创始人 IP 与体验式零售与我擅长的品牌叙事和会员运营高度契合，强劲增长也提供更大舞台。但强创始人依赖与高端小众天花板意味着需要在'传承 IP'与'体系化增长'间做好平衡。",
    risks: [
      "创始人 IP 高度依赖（关键人风险）",
      "高端小众市场天花板与出海不确定性",
      "行业竞争（国际高端彩妆反扑）",
    ],
    tradeOffs: [
      "大师 IP 溢价 vs 体系化去依赖",
      "高端稀缺 vs 规模扩张",
    ],
    sources: [
      "毛戈平 2025 年报 / 2023-2024 年报（港交所）",
      "公司公告：香港店开业与 L Catterton 合作",
      "公开新闻：IPO 与业绩报道",
    ],
    updatedAt: "2026-08-06",
  },
];
