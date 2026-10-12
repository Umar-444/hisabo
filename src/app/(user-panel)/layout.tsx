import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Scale,
  HandCoins,
  Bell,
  LogOut,
  PlusCircle,
  Settings,
} from "lucide-react";
import { getPendingActionsQuery } from "@/features/settlements";
import { UserSidebarNav } from "@/components/layout/user-sidebar-nav";

export const instant = false;

export default async function UserPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getUserSession();

  if (!session) {
    redirect("/login");
  }

  let pendingActionsCount = 0;
  try {
    const pendingActions = await getPendingActionsQuery(session.id);
    pendingActionsCount = pendingActions.totalCount;
  } catch (err) {
    console.error("Failed to load pending actions count:", err);
  }

  return (
    <div className="flex min-h-screen bg-[#F1F5F9] text-[#0F172A]">
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR (Visible on md and larger screens)                     */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200/90 sticky top-0 h-screen p-4 justify-between z-40">
        {/* Top Part: Brand + Quick Action + Nav Links */}
        <div className="space-y-4">
          {/* Brand Logo & Tagline */}
          <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#185CFF] text-white font-bold shadow-md shadow-[#185CFF]/25 text-base">
              H
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-[#0F172A] block leading-none">
                Hisabo
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Shared Ledgers</span>
            </div>
          </Link>

          {/* Quick Add Expense Action */}
          <Link
            href="/expenses/new"
            className="w-full flex items-center justify-center gap-1.5 h-9 px-3 rounded-lg bg-[#185CFF] text-white text-xs font-bold hover:bg-[#1249D6] transition-colors shadow-2xs"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Add Expense</span>
          </Link>

          {/* Sidebar Navigation Links (Client Island with Active Route Highlighting) */}
          <UserSidebarNav pendingActionsCount={pendingActionsCount} />
        </div>

        {/* Bottom Part: System Health Indicator + User Profile Card */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          {/* Micro Status Badge */}
          <div className="px-2.5 py-1.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[10px] text-emerald-800 font-semibold flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Ledger Invariant 100% OK</span>
          </div>

          {/* User Profile Info Card */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 text-[#185CFF] font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
                {session.name.charAt(0)}
              </div>
              <div className="min-w-0 text-left text-xs">
                <div className="font-bold text-[#0F172A] truncate leading-tight">
                  {session.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  @{session.username}
                </div>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN CONTENT WRAPPER (Top Navbar + Content Area + Mobile Tab Bar)      */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* --------------------------------------------------------------------- */}
        {/* DESKTOP TOP NAVBAR (Visible only on md and larger)                    */}
        {/* --------------------------------------------------------------------- */}
        <header className="hidden md:flex h-14 items-center justify-between px-6 lg:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-bold text-[#0F172A]">Workspace</span>
            <span>/</span>
            <span className="font-semibold text-[#185CFF]">User Dashboard</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Bell Notification with Ping Indicator */}
            <Link
              href="/settlements"
              title={
                pendingActionsCount > 0
                  ? `${pendingActionsCount} pending action${pendingActionsCount > 1 ? "s" : ""} require your review`
                  : "Settlements feed"
              }
              className="relative p-2 rounded-lg text-slate-500 hover:text-[#185CFF] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {pendingActionsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-white" />
                </span>
              )}
            </Link>

            {/* Settings Quick Icon */}
            <Link
              href="/settings"
              title="Account Settings"
              className="p-2 text-slate-500 hover:text-[#185CFF] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4" />
            </Link>

            {/* Quick Add Expense Link */}
            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#185CFF] text-white hover:bg-[#1249D6] transition-colors shadow-2xs cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add Expense</span>
            </Link>
          </div>
        </header>

        {/* --------------------------------------------------------------------- */}
        {/* MOBILE TOP HEADER (Preserved EXACTLY as before for mobile screens)    */}
        {/* --------------------------------------------------------------------- */}
        <header className="md:hidden sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#185CFF] text-white font-bold shadow-md shadow-[#185CFF]/25 text-lg">
                H
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
                  Hisabo
                </span>
              </div>
            </Link>

            {/* Mobile Header Right Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/settlements"
                title={
                  pendingActionsCount > 0
                    ? `${pendingActionsCount} pending action${pendingActionsCount > 1 ? "s" : ""} require your review`
                    : "Settlements feed"
                }
                className="relative p-2 rounded-xl text-slate-500 hover:text-[#185CFF] hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Bell className="h-4 w-4" />
                {pendingActionsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500 border border-white" />
                  </span>
                )}
              </Link>

              <Link
                href="/expenses/new"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#185CFF] text-white hover:bg-[#1249D6] transition-colors shadow-sm shadow-[#185CFF]/20 cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>Add</span>
              </Link>

              <Link
                href="/settings"
                title="Account Settings"
                className="p-2 text-slate-400 hover:text-[#185CFF] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4" />
              </Link>

              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* --------------------------------------------------------------------- */}
        {/* MAIN BODY AREA                                                        */}
        {/* --------------------------------------------------------------------- */}
        <main className="flex-1 py-6 px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
          <div className="mx-auto max-w-5xl">
            {children}
          </div>
        </main>

        {/* --------------------------------------------------------------------- */}
        {/* MOBILE BOTTOM TAB BAR (Preserved EXACTLY as before)                  */}
        {/* --------------------------------------------------------------------- */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-2 flex justify-around text-[10px] font-semibold text-slate-600">
          <Link href="/dashboard" className="flex flex-col items-center gap-1 py-1">
            <LayoutDashboard className="h-4 w-4" />
            Home
          </Link>
          <Link href="/groups" className="flex flex-col items-center gap-1 py-1">
            <Building2 className="h-4 w-4" />
            Groups
          </Link>
          <Link href="/expenses/new" className="flex flex-col items-center gap-1 py-1 text-[#185CFF]">
            <PlusCircle className="h-4 w-4" />
            Add
          </Link>
          <Link href="/balances" className="flex flex-col items-center gap-1 py-1">
            <Scale className="h-4 w-4" />
            Balances
          </Link>
          <Link href="/settlements" className="flex flex-col items-center gap-1 py-1 relative">
            <HandCoins className="h-4 w-4" />
            <span>Settling</span>
            {pendingActionsCount > 0 && (
              <span className="absolute top-0.5 right-2 flex h-2 w-2 rounded-full bg-amber-500" />
            )}
          </Link>
        </nav>
      </div>
    </div>
  );
}
