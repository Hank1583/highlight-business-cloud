import type { ReactNode } from "react";
import Link from "next/link";

const menu = [
  { label: "總覽", href: "/dashboard" },
  { label: "支援", href: "/dashboard/support" },
  { label: "設定", href: "/dashboard/settings" },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
        <div className="p-4">
          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Dashboard
          </div>

          <nav className="space-y-1">
            {menu.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2 text-sm font-medium transition ${
                  index === 0
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
      </section>
    </div>
  );
}