const cardClass =
  "rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">
              總覽 Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              商務雲各模組的整體狀態總覽與關鍵指標。
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className={cardClass}>
          <p className="text-sm font-medium text-slate-500">本週造訪數</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            12,430
          </p>
          <p className="mt-2 text-sm font-medium text-emerald-600">▲ 比上週 +18%</p>
        </div>

        <div className={cardClass}>
          <p className="text-sm font-medium text-slate-500">CRM 新增潛在客戶</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            87
          </p>
          <p className="mt-2 text-sm font-medium text-emerald-600">▲ 本月 +32</p>
        </div>

        <div className={cardClass}>
          <p className="text-sm font-medium text-slate-500">AI 自動回覆比例</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-900">
            73%
          </p>
          <p className="mt-2 text-sm font-medium text-blue-600">
            AI 協助降低客服負擔
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className={cardClass}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              GA 流量趨勢
            </h2>
            <span className="text-xs font-medium text-slate-400">最近 7 天</span>
          </div>

          <div className="flex h-56 items-end gap-2 rounded-2xl bg-slate-50 p-4">
            <div className="h-8 flex-1 rounded-xl bg-blue-300" />
            <div className="h-14 flex-1 rounded-xl bg-blue-300" />
            <div className="h-24 flex-1 rounded-xl bg-blue-400" />
            <div className="h-10 flex-1 rounded-xl bg-blue-300" />
            <div className="h-32 flex-1 rounded-xl bg-blue-500" />
            <div className="h-20 flex-1 rounded-xl bg-blue-400" />
            <div className="h-28 flex-1 rounded-xl bg-blue-400" />
          </div>

          <p className="mt-4 text-sm text-slate-500">
            模擬圖表：之後可以接 GA4 / 自建分析 API。
          </p>
        </div>

        <div className={cardClass}>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              廣告投放表現
            </h2>
            <span className="text-xs font-medium text-slate-400">本月累積</span>
          </div>

          <div className="space-y-4">
            {[
              ["Facebook Ads", "ROAS 3.2"],
              ["Google 搜尋廣告", "ROAS 4.8"],
              ["LINE 官方帳號推播", "CTR 5.4%"],
            ].map(([name, value]) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
              >
                <span className="font-medium text-slate-700">{name}</span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>

          <p className="mt-4 text-sm text-slate-500">
            之後可整合實際廣告平台 API（Meta / Google / LINE）。
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className={cardClass}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">
            今日任務摘要
          </h2>

          <ul className="space-y-3 text-sm text-slate-700">
            <li className="rounded-xl bg-slate-50 px-4 py-3">
              審核 5 筆新建立的 CRM 潛在客戶
            </li>
            <li className="rounded-xl bg-slate-50 px-4 py-3">
              檢查 SEO AI 給出的 3 項內容優化建議
            </li>
            <li className="rounded-xl bg-slate-50 px-4 py-3">
              確認廣告投放預算是否達到上限
            </li>
            <li className="rounded-xl bg-slate-50 px-4 py-3">
              回覆 2 則重要客訴（客服中心）
            </li>
          </ul>
        </div>

        <div className={cardClass}>
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-slate-900">
            系統狀態
          </h2>

          <ul className="space-y-3 text-sm text-slate-700">
            <li className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              ✅ GA 事件收集正常
            </li>
            <li className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              ✅ SEO AI 模組執行正常
            </li>
            <li className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              ✅ 客服中心連線正常
            </li>
            <li className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              ✅ CRM 資料庫連線正常
            </li>
            <li className="rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              ✅ 廣告 API 更新正常
            </li>
            <li className="rounded-xl bg-amber-50 px-4 py-3 text-amber-700">
              🕒 業務 AI Bot 排程中（00:30 每日彙總）
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}