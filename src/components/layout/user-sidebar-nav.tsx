"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Scale,
  HandCoins,
  Settings,
  Bell,
} from "lucide-react";

interface Props {
  pendingActionsCount: number;
  isCollapsed?: boolean;
}

export function UserSidebarNav({ pendingActionsCount, isCollapsed = false }: Props) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/groups",
      label: "Groups",
      icon: Building2,
      isActive: pathname.startsWith("/groups"),
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: Receipt,
      isActive: pathname.startsWith("/expenses"),
    },
    {
      href: "/balances",
      label: "Balances",
      icon: Scale,
      isActive: pathname === "/balances",
    },
    {
      href: "/settlements",
      label: "Settlements",
      icon: HandCoins,
      isActive: pathname.startsWith("/settlements"),
      badge: pendingActionsCount > 0 ? pendingActionsCount : undefined,
    },
    {
      href: "/notifications",
      label: "Notifications",
      icon: Bell,
      isActive: pathname.startsWith("/notifications"),
    },
    {
      href: "/settings",
      label: "Settings",
      icon: Settings,
      isActive: pathname === "/settings",
    },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            title={isCollapsed ? item.label : undefined}
            className={`flex items-center rounded-lg text-xs font-semibold transition-all ${
              isCollapsed
                ? "justify-center p-2.5"
                : "justify-between px-3 py-2"
            } ${
              item.isActive
                ? "bg-[#185CFF]/10 text-[#185CFF] font-bold shadow-2xs"
                : "text-slate-600 hover:text-[#0F172A] hover:bg-slate-100/80"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "relative" : "gap-2.5"}`}>
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  item.isActive ? "text-[#185CFF]" : "text-slate-400"
                }`}
              />
              {!isCollapsed && <span>{item.label}</span>}
              {isCollapsed && item.badge !== undefined && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-amber-500 animate-pulse ring-2 ring-white" />
              )}
            </div>

            {!isCollapsed && item.badge !== undefined && (
              <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-white animate-pulse">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
