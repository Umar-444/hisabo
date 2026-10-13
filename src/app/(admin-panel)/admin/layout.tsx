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
  Sliders,
  Sparkles,
  ChevronRight,
  Shield,
  Activity,
} from "lucide-react";

export const dynamic = "force-dynamic";

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
    <div className="flex min-h-screen bg-[#fafaf9] text-[#1a1a1a] antialiased">
      {/* Notion-style Light Workspace Sidebar */}
      <aside className="w-64 border-r border-[#e5e3df] bg-[#f7f6f3] flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Workspace Title & Identifier */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-[#e5e3df] bg-[#f7f6f3]">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#185CFF] text-white font-black text-xs shadow-2xs">
                H
              </div>
              <div className="truncate">
                <span className="font-bold text-xs text-[#0a1530] tracking-tight block truncate">
                  Hisabo Workspace
                </span>
                <span className="text-[10px] text-[#787671] block font-medium">
                  Admin Console
                </span>
              </div>
            </div>

            <span className="rounded-md bg-[#ebe8e1] px-1.5 py-0.5 text-[9px] font-bold text-[#5d5b54] uppercase tracking-wider border border-[#e5e3df]">
              Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 text-xs font-medium">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a4a097]">
              Platform Workspace
            </div>

            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#37352f] hover:bg-[#ebe8e1] hover:text-[#1a1a1a] transition-colors"
            >
              <LayoutDashboard className="h-4 w-4 text-[#185CFF]" />
              <span className="font-semibold">Overview</span>
            </Link>

            <Link
              href="/admin/users"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#37352f] hover:bg-[#ebe8e1] hover:text-[#1a1a1a] transition-colors"
            >
              <Users className="h-4 w-4 text-[#0f5132]" />
              <span>Users Management</span>
            </Link>

            <Link
              href="/admin/groups"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#37352f] hover:bg-[#ebe8e1] hover:text-[#1a1a1a] transition-colors"
            >
              <Building2 className="h-4 w-4 text-[#391c57]" />
              <span>Groups &amp; Flats</span>
            </Link>

            <Link
              href="/admin/currencies"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#37352f] hover:bg-[#ebe8e1] hover:text-[#1a1a1a] transition-colors"
            >
              <Coins className="h-4 w-4 text-[#793400]" />
              <span>Currencies &amp; FX</span>
            </Link>

            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#37352f] hover:bg-[#ebe8e1] hover:text-[#1a1a1a] transition-colors"
            >
              <FileText className="h-4 w-4 text-[#0a3663]" />
              <span>Audit Trail</span>
            </Link>

            <Link
              href="/admin/outbox"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#37352f] hover:bg-[#ebe8e1] hover:text-[#1a1a1a] transition-colors"
            >
              <Activity className="h-4 w-4 text-[#9c4221]" />
              <span>Outbox &amp; Tracing</span>
            </Link>

            <div className="pt-2 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#a4a097]">
              Controls &amp; Governance
            </div>

            <Link
              href="/admin/settings"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[#37352f] hover:bg-[#ebe8e1] hover:text-[#1a1a1a] transition-colors"
            >
              <Sliders className="h-4 w-4 text-[#e03131]" />
              <span>Platform Controls</span>
            </Link>
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-3 border-t border-[#e5e3df] bg-[#f7f6f3] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-2.5 py-1.5 text-xs text-[#787671] hover:text-[#1a1a1a] hover:bg-[#ebe8e1] rounded-lg transition-colors font-medium"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" />
              Public App View
            </span>
            <ChevronRight className="h-3 w-3 text-[#a4a097]" />
          </Link>

          <div className="flex items-center justify-between pt-2 border-t border-[#ede9e4]">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-md bg-[#dcecfa] text-[#0a3663] border border-[#c0dcf7] flex items-center justify-center text-[10px] font-black shrink-0">
                AD
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-[#0a1530] truncate leading-tight">
                  {session.name}
                </div>
                <div className="text-[10px] text-[#787671] truncate">{session.email}</div>
              </div>
            </div>

            <form action={adminLogoutAction}>
              <button
                type="submit"
                title="Sign out of Admin Console"
                className="p-1.5 text-[#787671] hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#ffffff]">
        {/* Notion Top Header */}
        <header className="h-14 border-b border-[#e5e3df] bg-white px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#787671] font-medium">Hisabo</span>
            <span className="text-[#a4a097]">/</span>
            <span className="text-[#1a1a1a] font-semibold flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-[#185CFF]" />
              Admin Workspace
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d9f3e1] text-[#0f5132] border border-[#b8e8c6] px-2.5 py-0.5 text-[11px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#1aae39] animate-pulse" />
              Neon DB Connected
            </span>

            <span className="text-[11px] bg-[#f0eeec] text-[#37352f] px-2 py-0.5 rounded-md border border-[#e5e3df] font-mono">
              Role: System Admin
            </span>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-[#fafaf9]">
          {children}
        </main>
      </div>
    </div>
  );
}
