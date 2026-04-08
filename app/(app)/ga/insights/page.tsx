"use client";
import React from "react";
export const runtime = 'edge';
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

function calcGrowth(curr: number, prev: number) {
  const c = safeNum(curr);
  const p = safeNum(prev);
  if (!p) return null;
  return ((c - p) / p) * 100;
}

export default function InsightsPage() {
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
    gaDailySummary = [],
    gaTrafficSources = [],
    loading: dataLoading,
    error: dataError,
  } = useGaData({
    ids: activeIds,
    dateRange,
  });

  const loading = connectionsLoading || dataLoading;
  const error = connectionsError || dataError;

  const totalOverview = useMemo(() => {
    let users = 0;
    let sessions = 0;
    let pageviews = 0;
    let events = 0;
    let newUsers = 0;
    let avgSessionDurationSum = 0;
    let bounceRateSum = 0;
    let days = 0;

    gaDailySummary.forEach((row: any) => {
      users += safeNum(row.users);
      sessions += safeNum(row.sessions);
      pageviews += safeNum(row.pageviews);
      events += safeNum(row.events);
      newUsers += safeNum(row.new_users);
      avgSessionDurationSum += safeNum(row.avg_session_duration);
      bounceRateSum += safeNum(row.bounce_rate);
      days += 1;
    });

    return {
      users,
      sessions,
      pageviews,
      events,
      new_users: newUsers,
      avg_session_duration: avg(avgSessionDurationSum, days),
      bounce_rate: avg(bounceRateSum, days),
    };
  }, [gaDailySummary]);

  const growthPack = useMemo(() => {
    const rows = [...gaDailySummary].sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );

    if (rows.length < 4) {
      return {
        sessionsGrowth: null,
        usersGrowth: null,
        pageviewsGrowth: null,
        eventsGrowth: null,
        bounceGrowth: null,
      };
    }

    const mid = Math.floor(rows.length / 2);
    const prev = rows.slice(0, mid);
    const curr = rows.slice(mid);

    const sumBlock = (block: any[]) => {
      let sessions = 0;
      let users = 0;
      let pageviews = 0;
      let events = 0;
      let bounceSum = 0;
      let days = 0;

      block.forEach((row) => {
        sessions += safeNum(row.sessions);
        users += safeNum(row.users);
        pageviews += safeNum(row.pageviews);
        events += safeNum(row.events);
        bounceSum += safeNum(row.bounce_rate);
        days += 1;
      });

      return {
        sessions,
        users,
        pageviews,
        events,
        bounce_rate: avg(bounceSum, days),
      };
    };

    const p = sumBlock(prev);
    const c = sumBlock(curr);

    return {
      sessionsGrowth: calcGrowth(c.sessions, p.sessions),
      usersGrowth: calcGrowth(c.users, p.users),
      pageviewsGrowth: calcGrowth(c.pageviews, p.pageviews),
      eventsGrowth: calcGrowth(c.events, p.events),
      bounceGrowth: calcGrowth(c.bounce_rate, p.bounce_rate),
    };
  }, [gaDailySummary]);

  const channelAgg = useMemo(() => {
    const byChannel: Record<string, { channel: string; sessions: number }> = {};

    gaTrafficSources.forEach((row: any) => {
      const key = row.channel_group || "Other";
      if (!byChannel[key]) {
        byChannel[key] = { channel: key, sessions: 0 };
      }
      byChannel[key].sessions += safeNum(row.sessions);
    });

    return Object.values(byChannel).sort((a, b) => b.sessions - a.sessions);
  }, [gaTrafficSources]);

  const deviceAgg = useMemo(() => {
    const byDevice: Record<string, { device: string; sessions: number }> = {};

    gaTrafficSources.forEach((row: any) => {
      const key = row.device || "Other";
      if (!byDevice[key]) {
        byDevice[key] = { device: key, sessions: 0 };
      }
      byDevice[key].sessions += safeNum(row.sessions);
    });

    return Object.values(byDevice).sort((a, b) => b.sessions - a.sessions);
  }, [gaTrafficSources]);

  const topChannel = channelAgg[0]?.channel ?? null;
  const topDevice = deviceAgg[0]?.device ?? null;

  const insights = useMemo(() => {
    const result: {
      title: string;
      message: string;
      tone: "good" | "warn" | "neutral";
    }[] = [];

    if (growthPack.sessionsGrowth !== null) {
      if (growthPack.sessionsGrowth >= 10) {
        result.push({
          title: "流量成長",
          message: `Sessions 成長 ${Math.round(
            growthPack.sessionsGrowth
          )}%，近期流量表現不錯。`,
          tone: "good",
        });
      } else if (growthPack.sessionsGrowth <= -10) {
        result.push({
          title: "流量下滑",
          message: `Sessions 下滑 ${Math.abs(
            Math.round(growthPack.sessionsGrowth)
          )}%，建議檢查投放、SEO 或近期活動變化。`,
          tone: "warn",
        });
      }
    }

    if (growthPack.usersGrowth !== null) {
      if (growthPack.usersGrowth >= 10) {
        result.push({
          title: "用戶成長",
          message: `Users 成長 ${Math.round(
            growthPack.usersGrowth
          )}%，代表網站觸及有提升。`,
          tone: "good",
        });
      } else if (growthPack.usersGrowth <= -10) {
        result.push({
          title: "用戶下降",
          message: `Users 下滑 ${Math.abs(
            Math.round(growthPack.usersGrowth)
          )}%，要留意流量來源是否減少。`,
          tone: "warn",
        });
      }
    }

    if (growthPack.bounceGrowth !== null) {
      if (growthPack.bounceGrowth <= -5) {
        result.push({
          title: "跳出率改善",
          message: `Bounce Rate 下降 ${Math.abs(
            Math.round(growthPack.bounceGrowth)
          )}%，內容或著陸頁表現變好。`,
          tone: "good",
        });
      } else if (growthPack.bounceGrowth >= 5) {
        result.push({
          title: "跳出率上升",
          message: `Bounce Rate 上升 ${Math.round(
            growthPack.bounceGrowth
          )}%，建議檢查頁面速度、版面和 CTA。`,
          tone: "warn",
        });
      }
    }

    const newUserRatio =
      totalOverview.users > 0
        ? totalOverview.new_users / totalOverview.users
        : 0;

    if (newUserRatio >= 0.6) {
      result.push({
        title: "新用戶比例高",
        message: "新用戶占比偏高，代表拓新有效，下一步要關注回訪與轉換。",
        tone: "neutral",
      });
    } else if (newUserRatio > 0 && newUserRatio <= 0.3) {
      result.push({
        title: "新用戶比例偏低",
        message: "新用戶比例偏低，建議加強 SEO、廣告曝光或導流合作。",
        tone: "warn",
      });
    }

    if (topChannel) {
      result.push({
        title: "主要流量來源",
        message: `目前 Sessions 主要來自 ${topChannel}。`,
        tone: "neutral",
      });
    }

    if (topDevice) {
      result.push({
        title: "主要裝置",
        message: `目前主要裝置為 ${topDevice}，可優先檢查該裝置體驗。`,
        tone: "neutral",
      });
    }

    if (result.length === 0) {
      result.push({
        title: "數據穩定",
        message: "目前未出現明顯異常波動，建議持續觀察。",
        tone: "neutral",
      });
    }

    return result;
  }, [growthPack, totalOverview, topChannel, topDevice]);

  const toneClassMap = {
    good: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Insights"
        description="根據真實 GA 資料整理出的重點洞察"
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
          載入洞察資料中...
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
          title="重點洞察"
          description={`${dateRange.start} ~ ${dateRange.end}`}
        >
          <div className="space-y-3">
            {insights.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className={[
                  "rounded-2xl border p-4 text-sm",
                  toneClassMap[item.tone],
                ].join(" ")}
              >
                <div className="font-bold">{item.title}</div>
                <div className="mt-1">{item.message}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}