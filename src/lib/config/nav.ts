import {
  LayoutDashboard,
  Radio,
  BookOpen,
  Building2,
  PenLine,
  Image,
  Languages,
  Library,
  Rss,
  Wrench,
  Briefcase,
  MessageSquare,
  Settings,
  Eye,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  /** Chinese label */
  label: string;
  /** English / short label */
  en: string;
  icon: LucideIcon;
  /** show a small unread badge (demo: static counts) */
  badge?: number;
}

export interface NavGroup {
  /** Chinese group title */
  title: string;
  /** English group title */
  en: string;
  items: NavItem[];
}

/**
 * 信息架构（v2.5）——
 * ARCHIVE：每日简报 / 市场情报 / 品牌案例库 / 公司研究
 * CREATE：创意工作室 / 视觉素材库
 * CAREER：作品集 / 面试题库 / 商务英语
 * LIBRARY：收藏集 / 来源体系 / 工具箱
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    title: "档案",
    en: "ARCHIVE",
    items: [
      { href: "/desk", label: "每日简报", en: "Daily Brief", icon: LayoutDashboard, badge: 0 },
      { href: "/signals", label: "市场情报", en: "Market Intelligence", icon: Radio },
      { href: "/cases", label: "品牌案例库", en: "Brand Casebook", icon: BookOpen },
      { href: "/companies", label: "公司研究", en: "Company Dossier", icon: Building2 },
    ],
  },
  {
    title: "创作",
    en: "CREATE",
    items: [
      { href: "/studio", label: "创意工作室", en: "Creative Studio", icon: PenLine },
      { href: "/visuals", label: "视觉素材库", en: "Visual Library", icon: Image },
    ],
  },
  {
    title: "职业",
    en: "CAREER",
    items: [
      { href: "/portfolio", label: "作品集", en: "Portfolio", icon: Briefcase },
      { href: "/interview", label: "面试题库", en: "Interview Bank", icon: MessageSquare },
      { href: "/english", label: "商务英语", en: "Business English", icon: Languages },
    ],
  },
  {
    title: "资料库",
    en: "LIBRARY",
    items: [
      { href: "/collections", label: "收藏集", en: "Collections", icon: Library },
      { href: "/watchlists", label: "观察名单", en: "Watchlists", icon: Eye },
      { href: "/sources", label: "来源体系", en: "Sources", icon: Rss },
      { href: "/tools", label: "营销工具箱", en: "Marketing Toolkit", icon: Wrench },
    ],
  },
];

/** 底部工具 */
export const FOOT_NAV: NavItem[] = [
  { href: "/settings", label: "设置", en: "Settings", icon: Settings },
];

/** 扁平化（便于路由匹配 / 面包屑） */
export const ALL_NAV: NavItem[] = [
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...FOOT_NAV,
];
