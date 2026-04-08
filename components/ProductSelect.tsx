"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Search,
  MessageCircle,
  Users,
  Megaphone,
  Bot,
} from "lucide-react";

export type ProductKey =
  | "dashboard"
  | "ga"
  | "seo"
  | "support"
  | "crm"
  | "ads"
  | "salesbot";

const products: {
  key: ProductKey;
  label: string;
  basePath: string;
  icon: any;
}[] = [
  { key: "dashboard", label: "儀錶板", basePath: "/dashboard", icon: LayoutDashboard },
  { key: "ga", label: "GA 數據系統", basePath: "/ga", icon: BarChart3 },
  { key: "seo", label: "SEO AI", basePath: "/seo", icon: Search },
  { key: "support", label: "客服中心", basePath: "/support", icon: MessageCircle },
  { key: "crm", label: "CRM", basePath: "/crm", icon: Users },
  { key: "ads", label: "廣告投放", basePath: "/ads", icon: Megaphone },
  { key: "salesbot", label: "業務 AI 助理", basePath: "/salesbot", icon: Bot },
];

type Props = {
  enabledProducts?: string[];
};

export default function ProductSelect({ enabledProducts = ["dashboard"] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const normalizedProducts = useMemo(() => {
    const safeEnabledProducts = Array.isArray(enabledProducts)
      ? enabledProducts
      : ["dashboard"];

    const validKeys = new Set(products.map((p) => p.key));

    return Array.from(
      new Set(
        ["dashboard", ...safeEnabledProducts].filter((key): key is ProductKey =>
          validKeys.has(key as ProductKey)
        )
      )
    );
  }, [enabledProducts]);

  const availableProducts = useMemo(() => {
    return products.filter((p) => normalizedProducts.includes(p.key));
  }, [normalizedProducts]);

  const current =
    availableProducts.find(
      (p) => pathname === p.basePath || pathname.startsWith(`${p.basePath}/`)
    ) ||
    availableProducts[0] ||
    products[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-2xl px-3 py-2 transition hover:bg-slate-100"
      >
        {(() => {
          const Icon = current.icon;
          return <Icon className="h-5 w-5 text-slate-600" />;
        })()}

        <span className="text-sm font-semibold text-slate-800">
          {current.label}
        </span>

        <svg
          className="h-4 w-4 text-slate-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="p-2">
            {availableProducts.map((p) => {
              const isActive = p.key === current.key;
              const Icon = p.icon;

              return (
                <button
                  type="button"
                  key={p.key}
                  onClick={() => {
                    router.push(p.basePath);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ${
                    isActive ? "bg-slate-100" : "hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-5 w-5 text-slate-500" />
                  <span className="text-sm font-medium text-slate-800">
                    {p.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}