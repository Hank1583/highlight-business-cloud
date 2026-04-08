"use client";
import React from "react";
export const runtime = 'edge';
import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ga/PageHeader";
import SectionCard from "@/components/ga/SectionCard";
import { useGAConnections, useGaData } from "../dataSource";
import {
  LineChart,
  Line,
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

type MetricKey = "sessions" | "users" | "pageviews" | "events";

const METRICS: MetricKey[] = ["sessions", "users", "pageviews", "events"];

export default function TrendPage() {
  const [dateRange, setDateRange] = useState(getLastDays(30));
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [visibleMetrics, setVisibleMetrics] = useState<MetricKey[]>([
    "sessions",
    "users",
  ]);

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
    gaDailySummary,
    loading: dataLoading,
    error: dataError,
  } = useGaData({
    ids: activeIds,
    dateRange,
  });

  const loading = connectionsLoading || dataLoading;
  const error = connectionsError || dataError;

  const trendData = useMemo(() => {
    const byDate: Record<string, any> = {};

    gaDailySummary.forEach((row: any) => {
      const date = row.date;
      if (!byDate[date]) {
        byDate[date] = {
          date,
          sessions: 0,
          users: 0,
          pageviews: 0,
          events: 0,
        };
      }

      byDate[date].sessions += safeNum(row.sessions);
      byDate[date].users += safeNum(row.users);
      byDate[date].pageviews += safeNum(row.pageviews);
      byDate[date].events += safeNum(row.events);
    });

    return Object.values(byDate).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );
  }, [gaDailySummary]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="趨勢分析"
        description="查看 Sessions、Users、Pageviews、Events 的趨勢變化"
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

        <div className="flex flex-wrap gap-2">
          {METRICS.map((metric) => {
            const checked = visibleMetrics.includes(metric);

            return (
              <label
                key={metric}
                className={[
                  "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold",
                  checked
                    ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                    : "border-slate-200 bg-white text-slate-600",
                ].join(" ")}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setVisibleMetrics((prev) => {
                      if (prev.includes(metric)) {
                        if (prev.length === 1) return prev;
                        return prev.filter((x) => x !== metric);
                      }
                      return [...prev, metric];
                    });
                  }}
                />
                {metric}
              </label>
            );
          })}
        </div>
      </div>

      {loading && (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          載入 GA 趨勢資料中...
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
          title="Traffic Trend"
          description={`${dateRange.start} ~ ${dateRange.end}`}
        >
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />

                {visibleMetrics.includes("sessions") && (
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={false}
                  />
                )}

                {visibleMetrics.includes("users") && (
                  <Line
                    type="monotone"
                    dataKey="users"
                    stroke="#16a34a"
                    strokeWidth={2}
                    dot={false}
                  />
                )}

                {visibleMetrics.includes("pageviews") && (
                  <Line
                    type="monotone"
                    dataKey="pageviews"
                    stroke="#9333ea"
                    strokeWidth={2}
                    dot={false}
                  />
                )}

                {visibleMetrics.includes("events") && (
                  <Line
                    type="monotone"
                    dataKey="events"
                    stroke="#ea580c"
                    strokeWidth={2}
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      )}
    </div>
  );
}