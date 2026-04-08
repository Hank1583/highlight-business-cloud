import type { ReactNode } from "react";
import SeoSidebar from "@/components/seo/SeoSidebar";

export default function SeoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <SeoSidebar />
        <main className="flex-1 overflow-x-auto">
          <div className="min-h-screen p-6 md:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}