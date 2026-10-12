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
} from "lucide-react";
import { getPendingActionsQuery } from "@/features/settlements";

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
    <div className="flex min-h-screen flex-col bg-[#fafaf9] text-[#1a1a1a]">
      {/* Notion-style Top Main Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-[#e5e3df] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#185cff] text-white font-black shadow-xs text-base transition-transform group-hover:scale-105">
                H
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#0a1530]">
                  Hisabo
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-[#787671]">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-[#0a1530] hover:bg-[#f6f5f4] transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-[#787671]" />
                Dashboard
              </Link>
              <Link
                href="/groups"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-[#0a1530] hover:bg-[#f6f5f4] transition-colors"
              >
                <Building2 className="h-4 w-4 text-[#787671]" />
                Groups
              </Link>
              <Link
                href="/expenses"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-[#0a1530] hover:bg-[#f6f5f4] transition-colors"
              >
                <Receipt className="h-4 w-4 text-[#787671]" />
                Expenses
              </Link>
              <Link
                href="/balances"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-[#0a1530] hover:bg-[#f6f5f4] transition-colors"
              >
                <Scale className="h-4 w-4 text-[#787671]" />
                Balances
              </Link>
              <Link
                href="/settlements"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:text-[#0a1530] hover:bg-[#f6f5f4] transition-colors relative"
              >
                <HandCoins className="h-4 w-4 text-[#787671]" />
                <span>Settlements</span>
                {pendingActionsCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#dd5b00] px-1.5 text-[10px] font-black text-white shadow-xs">
                    {pendingActionsCount}
                  </span>
                )}
              </Link>
            </nav>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Quick Bell Notification / Actions Icon */}
            <Link
              href="/settlements"
              title={
                pendingActionsCount > 0
                  ? `${pendingActionsCount} pending action${pendingActionsCount > 1 ? "s" : ""} require your review`
                  : "Settlements feed"
              }
              className="relative p-2 rounded-lg text-[#787671] hover:text-[#0a1530] hover:bg-[#f6f5f4] transition-colors cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {pendingActionsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#dd5b00] border border-white" />
                </span>
              )}
            </Link>

            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#185cff] text-white hover:bg-[#1249d6] transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Expense</span>
            </Link>

            <div className="h-6 w-px bg-[#e5e3df] mx-0.5 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-[#e6e0f5] text-[#7b3ff2] font-black text-xs flex items-center justify-center border border-purple-200">
                  {session.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-bold text-[#0a1530] leading-tight">
                    {session.name}
                  </div>
                  <div className="text-[10px] text-[#787671] font-mono">
                    @{session.username}
                  </div>
                </div>
              </div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Sign out"
                  className="p-2 text-[#787671] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#e5e3df] px-4 py-2 flex justify-around text-[10px] font-semibold text-[#787671]">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 py-1">
          <LayoutDashboard className="h-4 w-4" />
          Home
        </Link>
        <Link href="/groups" className="flex flex-col items-center gap-1 py-1">
          <Building2 className="h-4 w-4" />
          Groups
        </Link>
        <Link href="/expenses/new" className="flex flex-col items-center gap-1 py-1 text-[#185cff]">
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
            <span className="absolute top-0.5 right-2 flex h-2 w-2 rounded-full bg-[#dd5b00]" />
          )}
        </Link>
      </nav>
    </div>
  );
}
