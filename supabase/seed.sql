-- ============================================================
-- WORK / Archive — seed sources (master prompt §19)
-- Replaceable starting set. Feed URLs are intentionally NULL where
-- unverified — the product must NOT invent Feed URLs (§16.3).
-- ingestion_type 'manual' = verify/discover before scheduling.
-- ============================================================

insert into sources (name, domain, homepage_url, category, language, region, source_tier, ingestion_type, health_status, is_active)
values
  -- 19.1 中国美妆护肤
  ('国家药监局', 'nmpa.gov.cn', 'https://www.nmpa.gov.cn', 'beauty_cn', 'zh', '中国', 'A', 'html', 'unknown', true),
  ('CBO 化妆品财经在线', 'cbo.com.cn', 'https://www.cbo.com.cn', 'beauty_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('聚美丽', 'jumeili.cn', 'https://www.jumeili.cn', 'beauty_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('青眼', 'qingyanm.cn', 'https://www.qingyanm.cn', 'beauty_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('CBNData', 'cbndata.com', 'https://www.cbndata.com', 'beauty_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('SocialBeta', 'socialbeta.com', 'https://socialbeta.com', 'beauty_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),

  -- 19.2 中国营销与消费
  ('数英', 'digitaling.com', 'https://www.digitaling.com', 'marketing_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('广告门', 'adquan.com', 'https://www.adquan.com', 'marketing_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('Morketing', 'morketing.com', 'https://www.morketing.com', 'marketing_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('刀法研究所', 'daofa.io', 'https://www.daofa.io', 'marketing_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('TOPMarketing', 'topmarketing.com', 'https://www.topmarketing.com', 'marketing_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('新榜', 'newrank.cn', 'https://www.newrank.cn', 'marketing_cn', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('36氪', '36kr.com', 'https://36kr.com', 'consumer', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('第一财经', 'yicai.com', 'https://www.yicai.com', 'consumer', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('界面新闻', 'jiemian.com', 'https://www.jiemian.com', 'consumer', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('晚点 LatePost', 'latepost.com', 'https://www.latepost.com', 'consumer', 'zh', '中国', 'B', 'manual', 'unknown', true),

  -- 19.3 国际美妆、时尚与奢侈品
  ('Vogue Business', 'voguebusiness.com', 'https://www.voguebusiness.com', 'beauty_global', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Business of Fashion', 'businessoffashion.com', 'https://www.businessoffashion.com', 'fashion_luxury', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('WWD', 'wwd.com', 'https://wwd.com', 'beauty_global', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Glossy', 'glossy.co', 'https://www.glossy.co', 'fashion_luxury', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('BeautyMatter', 'beautymatter.com', 'https://www.beautymatter.com', 'beauty_global', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Jing Daily', 'jingdaily.com', 'https://jingdaily.com', 'fashion_luxury', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Luxury Daily', 'luxurydaily.com', 'https://www.luxurydaily.com', 'fashion_luxury', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Campaign Asia', 'campaignasia.com', 'https://www.campaignasia.com', 'marketing_global', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('The Drum', 'thedrum.com', 'https://www.thedrum.com', 'marketing_global', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Marketing Brew', 'marketingbrew.com', 'https://www.marketingbrew.com', 'marketing_global', 'en', '全球', 'B', 'rss', 'unknown', true),

  -- 19.4 AI 商业应用
  ('OpenAI', 'openai.com', 'https://openai.com', 'ai_business', 'en', '全球', 'A', 'manual', 'unknown', true),
  ('Think with Google', 'thinkwithgoogle.com', 'https://www.thinkwithgoogle.com', 'ai_business', 'en', '全球', 'A', 'manual', 'unknown', true),
  ('TikTok for Business', 'tiktok.com', 'https://www.tiktok.com/business', 'ai_business', 'en', '全球', 'A', 'manual', 'unknown', true),
  ('Meta for Business', 'business.facebook.com', 'https://www.facebook.com/business', 'ai_business', 'en', '全球', 'A', 'manual', 'unknown', true),
  ('Microsoft WorkLab', 'microsoft.com', 'https://www.microsoft.com/worklab', 'ai_business', 'en', '全球', 'A', 'manual', 'unknown', true),
  ('Adobe', 'adobe.com', 'https://www.adobe.com', 'ai_business', 'en', '全球', 'A', 'manual', 'unknown', true),
  ('Salesforce', 'salesforce.com', 'https://www.salesforce.com', 'ai_business', 'en', '全球', 'A', 'manual', 'unknown', true),
  ('MIT Technology Review', 'technologyreview.com', 'https://www.technologyreview.com', 'ai_business', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('机器之心', 'jiqizhixin.com', 'https://www.jiqizhixin.com', 'ai_business', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('量子位', 'qbitai.com', 'https://www.qbitai.com', 'ai_business', 'zh', '中国', 'B', 'manual', 'unknown', true),

  -- 19.5 商务英语
  ('Reuters', 'reuters.com', 'https://www.reuters.com', 'english', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Financial Times', 'ft.com', 'https://www.ft.com', 'english', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('The Economist', 'economist.com', 'https://www.economist.com', 'english', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Harvard Business Review', 'hbr.org', 'https://hbr.org', 'english', 'en', '全球', 'B', 'manual', 'unknown', true),

  -- 19.6 视觉
  ('Awwwards', 'awwwards.com', 'https://www.awwwards.com', 'visual', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('SiteInspire', 'siteinspire.com', 'https://www.siteinspire.com', 'visual', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('It’s Nice That', 'itsnicethat.com', 'https://www.itsnicethat.com', 'visual', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('The Brand Identity', 'thebrandidentity.com', 'https://www.thebrandidentity.com', 'visual', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('BP&O', 'bpando.org', 'https://www.bpando.org', 'visual', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Dezeen', 'dezeen.com', 'https://www.dezeen.com', 'visual', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Designboom', 'designboom.com', 'https://www.designboom.com', 'visual', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Creative Boom', 'creativeboom.com', 'https://www.creativeboom.com', 'visual', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Packaging of the World', 'packagingoftheworld.com', 'https://www.packagingoftheworld.com', 'visual', 'en', '全球', 'B', 'manual', 'unknown', true),

  -- 19.7 Podcast（Phase 4 将转入 podcasts 表）
  ('The BoF Podcast', 'businessoffashion.com', 'https://www.businessoffashion.com', 'podcast', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Acquired', 'acquired.fm', 'https://www.acquired.fm', 'podcast', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('Masters of Scale', 'mastersofscale.com', 'https://mastersofscale.com', 'podcast', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('HBR IdeaCast', 'hbr.org', 'https://hbr.org', 'podcast', 'en', '全球', 'B', 'manual', 'unknown', true),
  ('声动早咖啡', 'sheng.fm', null, 'podcast', 'zh', '中国', 'B', 'manual', 'unknown', true),
  ('半拿铁', null, null, 'podcast', 'zh', '中国', 'B', 'manual', 'unknown', true)
on conflict do nothing;
