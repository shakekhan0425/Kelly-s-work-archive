/**
 * 职场商务英语实战卡：内部编写的学习内容，不依赖外部新闻，也不要求跳转原文。
 */
export interface EnglishPracticeCard {
  id: string;
  category: string;
  phrase: string;
  meaning: string;
  use: string;
  example: string;
  note: string;
}

export const ENGLISH_PRACTICE: EnglishPracticeCard[] = [
  {
    id: "align-on",
    category: "会议协作",
    phrase: "align on",
    meaning: "就……达成共识 / 对齐",
    use: "开会确认目标、口径或下一步时，用它替代反复说 agree。",
    example: "Before we move forward, let's align on the objective and success metrics.",
    note: "常见搭配：align on the goal / timeline / priorities。",
  },
  {
    id: "circle-back",
    category: "跟进沟通",
    phrase: "circle back",
    meaning: "稍后回头跟进 / 再讨论",
    use: "暂时没有答案时礼貌地保留后续，不等于敷衍结束。",
    example: "I'll circle back with the updated numbers by Friday.",
    note: "比 I'll tell you later 更职业；最好补充具体时间。",
  },
  {
    id: "take-offline",
    category: "会议黑话",
    phrase: "take this offline",
    meaning: "会后单独讨论",
    use: "议题太细或只涉及少数人时，把会议拉回主线。",
    example: "This is useful, but let's take it offline and keep the launch discussion moving.",
    note: "不是断网；可理解为会后私聊、另开会或另建文档。",
  },
  {
    id: "bandwidth",
    category: "资源排期",
    phrase: "bandwidth",
    meaning: "时间 / 精力 / 人力余量",
    use: "讨论能否接新任务时，比 I am busy 更准确。",
    example: "We don't have the bandwidth to add another market this quarter.",
    note: "谈的是团队容量，不是网络带宽。",
  },
  {
    id: "move-the-needle",
    category: "结果表达",
    phrase: "move the needle",
    meaning: "带来可衡量的实质改变",
    use: "汇报优先级时说明哪些动作真正影响增长、收入或效率。",
    example: "The new retention flow moved the needle on repeat purchase.",
    note: "通常与 metric / growth / revenue 搭配，避免只说 make an impact。",
  },
  {
    id: "low-hanging-fruit",
    category: "策略讨论",
    phrase: "low-hanging fruit",
    meaning: "容易先拿到的成果 / 低成本机会",
    use: "规划第一阶段动作时，先指出快速见效的改进。",
    example: "Fixing the checkout copy is the low-hanging fruit before we rebuild the site.",
    note: "适合说优先级，不代表这个动作长期价值最高。",
  },
  {
    id: "push-back",
    category: "跨部门沟通",
    phrase: "push back",
    meaning: "提出异议 / 反向争取",
    use: "专业地表达不同意见，不必把 disagree 说得很生硬。",
    example: "I want to push back on the assumption that more traffic will fix retention.",
    note: "push back on + 观点；push the meeting back 则是推迟会议，含义不同。",
  },
  {
    id: "raise-a-flag",
    category: "风险管理",
    phrase: "raise a flag",
    meaning: "提示风险 / 提醒注意",
    use: "发现预算、进度或合规问题时，先让团队看到风险。",
    example: "I want to raise a flag on the timeline before we commit to the launch date.",
    note: "比直接说 This is wrong 更适合跨团队场景。",
  },
  {
    id: "deep-dive",
    category: "分析汇报",
    phrase: "deep dive",
    meaning: "深入分析",
    use: "介绍专项拆解、用户研究或数据复盘。",
    example: "I'll share a deep dive into the drop-off points after the meeting.",
    note: "可作名词：a deep dive；也常说 do a deep dive into。",
  },
  {
    id: "get-buy-in",
    category: "推动项目",
    phrase: "get buy-in",
    meaning: "争取支持 / 获得关键人认可",
    use: "提案、变更或跨部门项目中，说明你不仅做方案，也推动落地。",
    example: "We need to get buy-in from sales before we change the pricing model.",
    note: "buy-in 是名词，不要写成 buy ins。常见搭配：secure / build buy-in。",
  },
  {
    id: "boil-the-ocean",
    category: "项目管理",
    phrase: "boil the ocean",
    meaning: "一开始想解决所有问题，范围过大",
    use: "帮助团队收窄范围，提出先做最小可行版本。",
    example: "Let's not boil the ocean—we can test the top two channels first.",
    note: "带有提醒意味，正式场合可换成 narrow the scope。",
  },
  {
    id: "keep-me-posted",
    category: "日常跟进",
    phrase: "keep me posted",
    meaning: "有进展请随时告诉我",
    use: "邮件或会议结尾确认持续同步，比 keep me updated 更自然口语。",
    example: "Keep me posted on the vendor decision, and I'll adjust the launch plan.",
    note: "语气友好但不强硬；需要明确责任时再补截止时间。",
  },
];
