export default function KpiCard({
  title,
  value,
  sub,
}: {
  title: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-semibold text-slate-500">{title}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-slate-900">{value}</div>
      {sub ? <div className="mt-2 text-xs text-slate-400">{sub}</div> : null}
    </div>
  );
}