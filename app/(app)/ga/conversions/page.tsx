"use client";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ga/PageHeader";
import SectionCard from "@/components/ga/SectionCard";
import { useGAConnections, useGaData } from "../dataSource";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function getLastDays(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - days + 1);

  const format = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  return {
    start: format(start),
    end: format(end),
  };
}

function safeNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function ConversionsPage() {
  const [dateRange, setDateRange] = useState(getLastDays(30));
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const {
    gaConnections,
    loading: connectionsLoading,
    error: connectionsError,
  } = useGAConnections();

  useEffect(() => {
    if (gaConnections.length > 0 && selectedIds.length === 0) {
      setSelectedIds(gaConnections.map((x) => x.id));
    }
  }, [gaConnections, selectedIds.length]);

  const allIds = useMemo(() => gaConnections.map((x) => x.id), [gaConnections]);
  const activeIds = selectedIds.length ? selectedIds : allIds;

  const {
    gaEvents = [],
    gaConversions = [],
    loading: dataLoading,
    error: dataError,
  } = useGaData({
    ids: activeIds,
    dateRange,
  });

  const loading = connectionsLoading || dataLoading;
  const error = connectionsError || dataError;

  const topEvents = useMemo(() => {
    const byName: Record<string, number> = {};

    gaEvents.forEach((e: any) => {
      const key = e.event_name || "(unknown)";
      byName[key] = (byName[key] || 0) + safeNum(e.event_count);
    });

    return Object.entries(byName)
      .map(([event_name, event_count]) => ({
        event_name,
        event_count,
      }))
      .sort((a, b) => b.event_count - a.event_count)
      .slice(0, 10);
  }, [gaEvents]);

  const topConversions = useMemo(() => {
    const byName: Record<string, { count: number; value: number }> = {};

    gaConversions.forEach((c: any) => {
      const key = c.conversion_name || "(unknown)";
      if (!byName[key]) {
        byName[key] = { count: 0, value: 0 };
      }

      byName[key].count += safeNum(c.count);
      byName[key].value += safeNum(c.value);
    });

    return Object.entries(byName)
      .map(([conversion_name, data]) => ({
        conversion_name,
        count: data.count,
        value: data.value,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [gaConversions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="轉換分析"
        description="查看 Events 與 Conversions，確認流量是否有帶來實際價值"
      />

      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
            onClick={() => setDateRange(getLastDays(7))}
          >
            最近 7 天
          </button>
          <button
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold"
            onClick={() => setDateRange(getLastDays(30))}
          >
            最近 30 天
          </button>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) =>
              setDateRange((d) => ({ ...d, start: e.target.value }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) =>
              setDateRange((d) => ({ ...d, end: e.target.value }))
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {gaConnections.map((ga) => {
            const checked = selectedIds.includes(ga.id);

            return (
              <label
                key={ga.id}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold",
                  checked
                    ? "border-blue-300 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-white text-slate-600",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setSelectedIds((prev) =>
                      prev.includes(ga.id)
                        ? prev.filter((x) => x !== ga.id)
                        : [...prev, ga.id]
                    );
                  }}
                />
                {ga.account_name}
              </label>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          載入轉換資料中...
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
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionCard
            title="Top Events"
            description={`${dateRange.start} ~ ${dateRange.end}`}
          >
            <div className="h-[320px]">
              {topEvents.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  目前沒有 events 資料
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topEvents}>
                    <XAxis dataKey="event_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="event_count" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Top Conversions"
            description={`${dateRange.start} ~ ${dateRange.end}`}
          >
            <div className="h-[320px]">
              {topConversions.length === 0 ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  目前沒有 conversions 資料
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topConversions}>
                    <XAxis dataKey="conversion_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#16a34a" />
                    <Bar dataKey="value" fill="#9333ea" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}