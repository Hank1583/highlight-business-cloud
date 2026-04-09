"use client";
import { useEffect, useState } from "react";
import PageHeader from "@/components/ga/PageHeader";
import SectionCard from "@/components/ga/SectionCard";
import { useGAConnections } from "../dataSource";

type User = {
  id: number;
  email?: string;
  name?: string;
};

export default function AccountPage() {
  const { gaConnections, loading, error } = useGAConnections();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let alive = true;

    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((res) => {
        if (!alive) return;
        if (res?.ok && res?.data?.id) {
          setUser(res.data);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        if (!alive) return;
        setUser(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  const accountFetchLink = user?.id
    ? `https://www.highlight.url.tw/business-cloud/ga/account_fetch.php?member_id=${user.id}`
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="帳號設定"
        description="查看目前綁定的 GA 帳號與狀態"
      />

      <div className="flex flex-wrap gap-3">
        {accountFetchLink && (
          <a
            href={accountFetchLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700"
          >
            ＋ 綁定 GA 帳號
          </a>
        )}
      </div>

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          載入帳號資料中...
        </div>
      )}

      {error && (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && gaConnections.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          目前沒有可用的 GA 帳號
        </div>
      )}

      {!loading && !error && gaConnections.length > 0 && (
        <SectionCard
          title="GA 帳號清單"
          description={`共 ${gaConnections.length} 個帳號`}
        >
          <div className="space-y-3">
            {gaConnections.map((item) => {
              const status = item.status || "ACTIVE";
              const isDisabled = status === "DISABLED";

              return (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <div className="truncate text-base font-bold text-slate-900">
                      {item.account_name}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      ID: {item.id}
                    </div>

                    <div className="mt-1 text-sm text-slate-500">
                      Property ID: {item.property_id ?? "-"}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-bold",
                        isDisabled
                          ? "bg-slate-100 text-slate-600"
                          : "bg-emerald-50 text-emerald-700",
                      ].join(" ")}
                    >
                      {status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}
    </div>
  );
}