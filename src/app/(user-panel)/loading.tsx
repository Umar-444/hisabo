import { Loader2 } from "lucide-react";

export default function UserPanelLoading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <div className="space-y-2">
          <div className="h-6 w-44 rounded-lg bg-slate-200" />
          <div className="h-3.5 w-64 rounded-md bg-slate-200/70" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-slate-200" />
      </div>

      {/* Main Skeleton Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Hero Card Skeleton) */}
        <div className="space-y-4 lg:col-span-7">
          <div className="h-56 w-full rounded-[24px] bg-gradient-to-br from-slate-200 to-slate-300 p-6 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="h-4 w-32 rounded bg-white/40" />
              <div className="h-5 w-16 rounded-full bg-white/40" />
            </div>
            <div className="space-y-2">
              <div className="h-10 w-48 rounded-lg bg-white/50" />
              <div className="h-3.5 w-56 rounded bg-white/40" />
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-10 flex-1 rounded-xl bg-white/60" />
              <div className="h-10 flex-1 rounded-xl bg-white/30" />
            </div>
          </div>

          <div className="h-14 w-full rounded-xl bg-slate-200/80" />
        </div>

        {/* Right Column (Cards Skeleton) */}
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="h-4 w-28 rounded bg-slate-200" />
              <div className="h-3 w-16 rounded bg-slate-200" />
            </div>
            <div className="space-y-3 pt-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="h-3.5 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                  </div>
                  <div className="h-4 w-14 rounded bg-slate-200 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
