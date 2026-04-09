"use client";
import { useEffect, useMemo, useState } from "react";
import PageHeader from "@/components/ga/PageHeader";
import SectionCard from "@/components/ga/SectionCard";
import { useGAConnections, useGaData } from "../dataSource";

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

function avg(sum: number, count: number) {
  return sum / Math.max(1, count);
}

export default function PagesPage() {
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
    gaPages,
    loading: dataLoading,
    error: dataError,
  } = useGaData({
    ids: activeIds,
    dateRange,
  });

  const loading = connectionsLoading || dataLoading;
  const error = connectionsError || dataError;

  const topPages = useMemo(() => {
    const map: Record<
      string,
      {
        page_path: string;
        page_title: string;
        pageviews: number;
        users: number;
        avg_time_sum: number;
        row_count: number;
      }
    > = {};

    gaPages.forEach((p: any) => {
      const key = p.page_path || "(unknown)";

      if (!map[key]) {
        map[key] = {
          page_path: key,
          page_title: p.page_title || "",
          pageviews: 0,
          users: 0,
          avg_time_sum: 0,
          row_count: 0,
        };
      }

      map[key].pageviews += safeNum(p.pageviews);
      map[key].users += safeNum(p.users);
      map[key].avg_time_sum += safeNum(p.avg_time);
      map[key].row_count += 1;

      if (!map[key].page_title && p.page_title) {
        map[key].page_title = p.page_title;
      }
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        avg_time: avg(item.avg_time_sum, item.row_count),
      }))
      .sort((a, b) => b.pageviews - a.pageviews);
  }, [gaPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="頁面分析"
        description="比較不同頁面的流量表現與熱門頁面排行"
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
          載入頁面資料中...
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
          title="Top Pages"
          description={`${dateRange.start} ~ ${dateRange.end}`}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                  <th className="px-4 py-3 text-left font-bold">Page Path</th>
                  <th className="px-4 py-3 text-left font-bold">Page Title</th>
                  <th className="px-4 py-3 text-right font-bold">Pageviews</th>
                  <th className="px-4 py-3 text-right font-bold">Users</th>
                  <th className="px-4 py-3 text-right font-bold">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {topPages.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      目前查無頁面資料
                    </td>
                  </tr>
                )}

                {topPages.map((row) => (
                  <tr
                    key={row.page_path}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-4 py-3 text-left text-slate-800">
                      {row.page_path}
                    </td>
                    <td className="px-4 py-3 text-left text-slate-600">
                      {row.page_title || "-"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {row.pageviews}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {row.users}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700">
                      {Math.round(row.avg_time || 0)}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}