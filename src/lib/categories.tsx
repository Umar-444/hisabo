import React from "react";
import {
  UtensilsCrossed,
  ShoppingBag,
  Building2,
  Zap,
  Car,
  Film,
  Receipt,
  HandCoins,
  type LucideIcon,
} from "lucide-react";
import { cn } from "./utils";

export type ExpenseCategoryId =
  | "food"
  | "groceries"
  | "rent"
  | "utilities"
  | "transport"
  | "entertainment"
  | "general";

export interface CategoryMeta {
  id: ExpenseCategoryId | "housing" | "settlement";
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  tileBg: string;
  iconColor: string;
  borderColor: string;
}

export const CATEGORIES_META: Record<string, CategoryMeta> = {
  food: {
    id: "food",
    label: "Food & Dining",
    shortLabel: "Food",
    icon: UtensilsCrossed,
    tileBg: "bg-amber-50",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200/70",
  },
  groceries: {
    id: "groceries",
    label: "Groceries",
    shortLabel: "Groceries",
    icon: ShoppingBag,
    tileBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    borderColor: "border-emerald-200/70",
  },
  rent: {
    id: "rent",
    label: "Rent & Housing",
    shortLabel: "Rent",
    icon: Building2,
    tileBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-200/70",
  },
  housing: {
    id: "housing",
    label: "Rent & Housing",
    shortLabel: "Housing",
    icon: Building2,
    tileBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
    borderColor: "border-indigo-200/70",
  },
  utilities: {
    id: "utilities",
    label: "Utilities & Bills",
    shortLabel: "Utilities",
    icon: Zap,
    tileBg: "bg-sky-50",
    iconColor: "text-sky-600",
    borderColor: "border-sky-200/70",
  },
  transport: {
    id: "transport",
    label: "Transport & Rides",
    shortLabel: "Transport",
    icon: Car,
    tileBg: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200/70",
  },
  entertainment: {
    id: "entertainment",
    label: "Entertainment & Fun",
    shortLabel: "Fun",
    icon: Film,
    tileBg: "bg-rose-50",
    iconColor: "text-rose-600",
    borderColor: "border-rose-200/70",
  },
  general: {
    id: "general",
    label: "General Expense",
    shortLabel: "General",
    icon: Receipt,
    tileBg: "bg-slate-100",
    iconColor: "text-slate-700",
    borderColor: "border-slate-200/80",
  },
  settlement: {
    id: "settlement",
    label: "Settlement Payment",
    shortLabel: "Settlement",
    icon: HandCoins,
    tileBg: "bg-teal-50",
    iconColor: "text-teal-600",
    borderColor: "border-teal-200/70",
  },
};

export const EXPENSE_CATEGORIES_LIST: CategoryMeta[] = [
  CATEGORIES_META.food,
  CATEGORIES_META.groceries,
  CATEGORIES_META.rent,
  CATEGORIES_META.utilities,
  CATEGORIES_META.transport,
  CATEGORIES_META.entertainment,
  CATEGORIES_META.general,
];

export function getCategoryMeta(catId?: string | null): CategoryMeta {
  if (!catId) return CATEGORIES_META.general;
  const normalized = catId.toLowerCase().trim();
  return CATEGORIES_META[normalized] || CATEGORIES_META.general;
}

export function CategoryTile({
  category,
  size = "md",
  className = "",
}: {
  category?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const meta = getCategoryMeta(category);
  const Icon = meta.icon;

  const sizeClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-9 w-9 rounded-lg",
    lg: "h-14 w-14 rounded-2xl",
  }[size];

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-4.5 w-4.5",
    lg: "h-7 w-7",
  }[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border shadow-2xs transition-colors",
        sizeClasses,
        meta.tileBg,
        meta.iconColor,
        meta.borderColor,
        className
      )}
    >
      <Icon className={cn(iconSizes, "stroke-[2.2]")} />
    </div>
  );
}
