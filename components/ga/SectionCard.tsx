import { ReactNode } from "react";

export default function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4">
        <div className="text-base font-extrabold text-slate-900">{title}</div>
        {description ? <div className="mt-1 text-sm text-slate-500">{description}</div> : null}
      </div>
      {children}
    </section>
  );
}