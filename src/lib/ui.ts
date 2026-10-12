import { cn } from "./utils";

export interface BtnOptions {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
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
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none cursor-pointer";

    const sizes = {
      sm: "h-9 px-3.5 text-xs rounded-lg gap-1.5",
      md: "h-11 px-5 text-sm rounded-xl gap-2",
      lg: "h-13 px-7 text-base rounded-2xl gap-2.5",
    };

    const variants = {
      primary:
        "bg-[#185CFF] text-white hover:bg-[#1249D6] shadow-sm shadow-[#185CFF]/20 focus-visible:ring-[#185CFF]",
      secondary:
        "bg-slate-100 text-[#0F172A] hover:bg-slate-200 focus-visible:ring-slate-400",
      outline:
        "border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-50 focus-visible:ring-slate-400 shadow-xs",
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
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-slate-400 transition-colors focus:border-[#185CFF] focus:outline-none focus:ring-3 focus:ring-[#185CFF]/15 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-75 shadow-2xs",
  
  select:
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-[#0F172A] transition-colors focus:border-[#185CFF] focus:outline-none focus:ring-3 focus:ring-[#185CFF]/15 shadow-2xs cursor-pointer",

  label:
    "block text-xs font-semibold tracking-wide text-slate-700 uppercase mb-1.5",

  // Cards & Surfaces
  card:
    "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-shadow hover:shadow-sm",

  cardInteractive:
    "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all hover:border-[#185CFF]/40 hover:shadow-md cursor-pointer",

  // Badges & Status Chips
  badge: ({ status = "pending", className }: BadgeOptions = {}) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider";
    
    const statuses = {
      pending: "bg-amber-50 text-amber-700 border border-amber-200",
      accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      confirmed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      disputed: "bg-red-50 text-red-700 border border-red-200",
      cancelled: "bg-slate-100 text-slate-600 border border-slate-200",
      active: "bg-blue-50 text-blue-700 border border-blue-200",
    };

    return cn(base, statuses[status], className);
  },

  // Layout Containers
  container: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8",
};
