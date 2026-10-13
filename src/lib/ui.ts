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
      sm: "h-9 px-3 text-xs rounded-md gap-1.5",
      md: "h-10 px-4 text-sm rounded-lg gap-2",
      lg: "h-12 px-6 text-sm rounded-lg gap-2.5",
    };

    const variants = {
      primary:
        "bg-[#185CFF] text-white hover:bg-[#1249D6] shadow-2xs focus-visible:ring-[#185CFF]",
      hero:
        "bg-white text-[#185CFF] hover:bg-white/95 shadow-2xs focus-visible:ring-white",
      secondary:
        "bg-[#f0eeec] text-[#1a1a1a] hover:bg-[#e5e3df] focus-visible:ring-slate-300",
      outline:
        "border border-[#c8c4be] bg-white text-[#1a1a1a] hover:bg-[#f6f5f4] focus-visible:ring-[#185CFF] shadow-2xs",
      ghost:
        "text-[#787671] hover:text-[#1a1a1a] hover:bg-[#f6f5f4] focus-visible:ring-slate-300",
      danger:
        "bg-[#EF4444] text-white hover:bg-red-600 shadow-2xs focus-visible:ring-red-500",
      success:
        "bg-[#10B981] text-white hover:bg-emerald-600 shadow-2xs focus-visible:ring-emerald-500",
    };

    return cn(base, sizes[size], variants[variant], className);
  },

  // Inputs & Form Controls (Notion Sharp Style)
  input:
    "w-full rounded-lg border border-[#c8c4be] bg-white px-3.5 py-2 text-sm text-[#1a1a1a] placeholder:text-[#a4a097] transition-all focus:border-[#185CFF] focus:outline-none focus:ring-1 focus:ring-[#185CFF] disabled:cursor-not-allowed disabled:bg-[#f6f5f4] disabled:opacity-75 shadow-2xs",
  
  select:
    "w-full rounded-lg border border-[#c8c4be] bg-white px-3.5 py-2 text-sm text-[#1a1a1a] transition-all focus:border-[#185CFF] focus:outline-none focus:ring-1 focus:ring-[#185CFF] shadow-2xs cursor-pointer",

  label:
    "block text-[11px] font-bold tracking-wider text-[#787671] uppercase mb-1.5",

  // Cards & Surfaces (Notion Hairline & Sharp Borders)
  card:
    "rounded-xl border border-[#e5e3df] bg-white p-5 sm:p-6 shadow-2xs transition-all hover:border-[#c8c4be]",

  heroCard:
    "relative overflow-hidden rounded-xl bg-gradient-to-br from-[#185CFF] via-[#1552E6] to-[#0D40C9] p-5 sm:p-6 text-white shadow-md shadow-[#185CFF]/20 border border-blue-600/30",

  settleSmartBanner:
    "flex items-center gap-3.5 rounded-xl border border-[#c0dcf7] bg-[#dcecfa]/70 p-3.5 sm:p-4 shadow-2xs hover:border-[#185CFF]/50 transition-all cursor-pointer",

  categoryTile:
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0eeec] text-[#185CFF] font-bold text-base border border-[#e5e3df]",

  transactionRow:
    "flex items-center gap-3.5 py-3 border-b border-[#ede9e4] last:border-b-0 hover:bg-[#fafaf9] -mx-2 px-2 rounded-lg transition-colors cursor-pointer",

  // Badges & Status Chips (Notion Sharp Style)
  badge: ({ status = "pending", className }: BadgeOptions = {}) => {
    const base = "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider";
    
    const statuses = {
      pending: "bg-[#fef7d6] text-[#793400] border border-[#f9e79f]",
      accepted: "bg-[#d9f3e1] text-[#0f5132] border border-[#b8e8c6]",
      confirmed: "bg-[#dcecfa] text-[#0a3663] border border-[#c0dcf7]",
      disputed: "bg-[#fde0ec] text-[#e03131] border border-[#f5b8d0]",
      cancelled: "bg-[#f0eeec] text-[#787671] border border-[#e5e3df]",
      active: "bg-[#e6e0f5] text-[#391c57] border border-[#d1c7ec]",
    };

    return cn(base, statuses[status], className);
  },

  // Layout Containers
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
};
