import { getAdminSession } from "@/lib/auth/admin-session";
import Link from "next/link";
import { adminLogoutAction } from "@/features/admin/actions";
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Coins,
  LogOut,
  ExternalLink,
} from "lucide-react";

export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  // If not authenticated, render children directly (allows /admin/login to show login form)
  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#0F172A] text-slate-100">
      {/* Desktop & Mobile Admin Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/95 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Platform Identifier */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#185CFF] text-white font-bold shadow-md shadow-[#185CFF]/30">
              H
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Hisabo
              </span>
              <span className="block text-[10px] font-semibold text-blue-400 tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-sm font-medium">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-blue-400" />
              Overview
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Users className="h-4 w-4 text-emerald-400" />
              Users Management
            </Link>

            <Link
              href="/admin/groups"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Building2 className="h-4 w-4 text-purple-400" />
              Groups &amp; Flats
            </Link>

            <Link
              href="/admin/currencies"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Coins className="h-4 w-4 text-amber-400" />
              Currencies &amp; FX
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <FileText className="h-4 w-4 text-cyan-400" />
              Audit Trail
            </Link>
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Public App View
            </span>
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-[#185CFF]/20 border border-[#185CFF]/40 flex items-center justify-center text-xs font-bold text-blue-400">
                AD
              </div>
              <div className="text-left">
                <div className="text-xs font-semibold text-white leading-tight">
                  {session.name}
                </div>
                <div className="text-[10px] text-slate-400">{session.email}</div>
              </div>
            </div>

            <form action={adminLogoutAction}>
              <button
                type="submit"
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0B1120]">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-400">
              PostgreSQL Connected · Neon Project: <span className="font-mono text-slate-200">young-brook</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
              Role: System Administrator
            </span>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
