import {
  LayoutDashboard,
  LineChart,
  Brain,
  Megaphone,
  FileText,
  Target,
  Mail,
  Settings,
} from "lucide-react";

export const gaNavItems = [
  {
    group: "分析總覽",
    items: [
      { title: "總覽", href: "/ga", icon: LayoutDashboard },
      { title: "趨勢分析", href: "/ga/trend", icon: LineChart },
      { title: "AI 洞察", href: "/ga/insights", icon: Brain },
    ],
  },
  {
    group: "成效分析",
    items: [
      { title: "流量來源", href: "/ga/traffic", icon: Megaphone },
      { title: "頁面分析", href: "/ga/pages", icon: FileText },
      { title: "轉換分析", href: "/ga/conversions", icon: Target },
    ],
  },
  {
    group: "系統管理",
    items: [
      { title: "報表", href: "/ga/report", icon: Mail },
      { title: "帳號設定", href: "/ga/account", icon: Settings },
    ],
  },
] as const;