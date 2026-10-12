import { cn } from "./utils";

export interface BtnOptions {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "hero";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export interface BadgeOptions {
  status?: "pending" | "accepted" | "disputed" | "confirmed" | "cancelled" | "active";
  className?: string;
}

export const ui = {
  // Buttons
  btn: ({ variant = "primary", size = "md", className }: BtnOptions = {}) => {
    const base =
      "inline-flex items-center justify-center font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";

    const sizes = {
      sm: "h-9 px-3.5 text-xs rounded-[12px] gap-1.5",
      md: "h-11 px-5 text-sm rounded-[14px] gap-2",
      lg: "h-13 px-7 text-base rounded-[16px] gap-2.5",
    };

    const variants = {
      primary:
        "bg-[#185CFF] text-white hover:bg-[#1249D6] shadow-sm shadow-[#185CFF]/20 focus-visible:ring-[#185CFF]",
      hero:
        "bg-white text-[#185CFF] hover:bg-white/95 shadow-sm focus-visible:ring-white",
      secondary:
        "bg-[#EBF2FF] text-[#185CFF] hover:bg-blue-100 focus-visible:ring-blue-300",
      outline:
        "border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-50 focus-visible:ring-slate-400 shadow-2xs",
      ghost:
        "text-slate-600 hover:text-[#0F172A] hover:bg-slate-100/80 focus-visible:ring-slate-300",
      danger:
        "bg-[#EF4444] text-white hover:bg-red-600 shadow-sm shadow-red-500/20 focus-visible:ring-red-500",
      success:
        "bg-[#10B981] text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 focus-visible:ring-emerald-500",
    };

    return cn(base, sizes[size], variants[variant], className);
  },

  // Inputs & Form Controls
  input:
    "w-full rounded-[14px] border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 transition-colors focus:border-[#185CFF] focus:outline-none focus:ring-3 focus:ring-[#185CFF]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75 shadow-2xs",
  
  select:
    "w-full rounded-[14px] border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0F172A] transition-colors focus:border-[#185CFF] focus:outline-none focus:ring-3 focus:ring-[#185CFF]/15 shadow-2xs cursor-pointer",

  label:
    "block text-xs font-bold tracking-wide text-slate-700 uppercase mb-1.5",

  // Cards & Surfaces
  card:
    "rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-sm",

  heroCard:
    "relative overflow-hidden rounded-[24px] bg-gradient-to-br from-[#185CFF] via-[#1552E6] to-[#0D40C9] p-6 sm:p-7 text-white shadow-xl shadow-[#185CFF]/25",

  settleSmartBanner:
    "flex items-center gap-3.5 rounded-[16px] border border-slate-200/90 bg-white p-4 shadow-xs hover:border-[#185CFF]/30 transition-all cursor-pointer",

  categoryTile:
    "flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[#EBF2FF] text-[#185CFF] font-bold text-base border border-blue-100/60",

  transactionRow:
    "flex items-center gap-3.5 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70 -mx-3 px-3 rounded-xl transition-colors cursor-pointer",

  // Badges & Status Chips
  badge: ({ status = "pending", className }: BadgeOptions = {}) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider";
    
    const statuses = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200/80",
      accepted: "bg-emerald-50 text-[#10B981] border border-emerald-200/80",
      confirmed: "bg-blue-50 text-[#185CFF] border border-blue-200/80",
      disputed: "bg-red-50 text-[#EF4444] border border-red-200/80",
      cancelled: "bg-slate-100 text-slate-600 border border-slate-200",
      active: "bg-blue-50 text-blue-700 border border-blue-200",
    };

    return cn(base, statuses[status], className);
  },

  // Layout Containers
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
};
