"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Search, Wrench, Sparkles, Globe2, PlusCircle } from "lucide-react";

const menuItems = [
  {
    href: "/seo",
    label: "SEO 總覽",
    icon: BarChart3,
  },
  {
    href: "/seo?tab=keywords",
    label: "關鍵字分析",
    icon: Search,
  },
  {
    href: "/seo?tab=issues",
    label: "技術問題",
    icon: Wrench,
  },
  {
    href: "/seo?tab=ai",
    label: "AI 建議",
    icon: Sparkles,
  },
];

export default function SeoSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[260px] shrink-0 border-r border-slate-200 bg-white lg:block">
      <div className="flex h-full flex-col">
        <div className="px-4 py-5">
          <div className="mb-3 px-3 text-xs font-semibold tracking-wide text-slate-400">
            分析總覽
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === "/seo";

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  ].join(" ")}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto border-t border-slate-200 p-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <PlusCircle size={16} />
              快速提醒
            </div>
            <p className="text-xs leading-5 text-slate-500">
              新增網站前，請先到 Search Console 加入服務帳號權限。
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}