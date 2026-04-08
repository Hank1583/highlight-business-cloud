"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3 } from "lucide-react";
import { gaNavItems } from "@/lib/ga/ga-nav";

export default function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="space-y-6">
          {gaNavItems.map((group) => (
            <div key={group.group}>
              <div className="mb-2 px-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                {group.group}
              </div>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      className={[
                        "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                        active
                          ? "bg-blue-50 text-blue-700 shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      ].join(" ")}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="text-xs font-bold text-slate-500">PLAN</div>
          <div className="mt-1 text-sm font-extrabold text-slate-900">PRO</div>
          <div className="mt-2 text-xs text-slate-500">可使用日期區間、多 GA、頁面與轉換分析</div>
        </div>
      </div>
    </aside>
  );
}