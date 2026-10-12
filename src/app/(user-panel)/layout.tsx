import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Scale,
  LogOut,
  PlusCircle,
} from "lucide-react";

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

  return (
    <div className="flex min-h-screen flex-col bg-[#F1F5F9] text-[#0F172A]">
      {/* Top Main Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
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

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-semibold text-slate-600">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:text-[#185CFF] hover:bg-slate-50 transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-400" />
                Dashboard
              </Link>
              <Link
                href="/groups"
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:text-[#185CFF] hover:bg-slate-50 transition-colors"
              >
                <Building2 className="h-4 w-4 text-slate-400" />
                Groups
              </Link>
              <Link
                href="/expenses"
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:text-[#185CFF] hover:bg-slate-50 transition-colors"
              >
                <Receipt className="h-4 w-4 text-slate-400" />
                Expenses
              </Link>
              <Link
                href="/balances"
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:text-[#185CFF] hover:bg-slate-50 transition-colors"
              >
                <Scale className="h-4 w-4 text-slate-400" />
                Balances
              </Link>
            </nav>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-3">
            <Link
              href="/expenses/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#185CFF] text-white hover:bg-[#1249D6] transition-colors shadow-sm shadow-[#185CFF]/20 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Expense</span>
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-blue-100 text-[#185CFF] font-bold text-xs flex items-center justify-center border border-blue-200">
                  {session.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left text-xs">
                  <div className="font-bold text-[#0F172A] leading-tight">
                    {session.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    @{session.username}
                  </div>
                </div>
              </div>

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
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar */}
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
      </nav>
    </div>
  );
}
