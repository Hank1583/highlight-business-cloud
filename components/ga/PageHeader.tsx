import { ReactNode } from "react";

export default function PageHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
          {title}
        </h1>
        {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
      </div>
      {right ? <div>{right}</div> : null}
    </div>
  );
}