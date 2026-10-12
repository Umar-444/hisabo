import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/money";
import {
  initialAdminStats,
  initialAdminUsers,
  initialAdminGroups,
  initialAdminAuditLogs,
} from "@/features/admin/mock-data";
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
} from "lucide-react";

export const instant = false;

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const stats = initialAdminStats;
  const recentUsers = initialAdminUsers.slice(0, 4);
  const recentGroups = initialAdminGroups.slice(0, 3);
  const recentLogs = initialAdminAuditLogs.slice(0, 3);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, user account status, and zero-sum financial health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Manage Users
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/admin/groups"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#185CFF] text-white hover:bg-blue-600 transition-colors shadow-sm shadow-[#185CFF]/30"
          >
            View Groups
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Primary Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {stats.totalUsers}
            </span>
            <span className="text-xs font-semibold text-emerald-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +12% this week
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            242 active · 6 suspended
          </p>
        </div>

        {/* Active Groups */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Groups
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {stats.activeGroups}
            </span>
            <span className="text-xs font-semibold text-purple-400">
              Flats & Trips
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Avg. 4.2 members per group
          </p>
        </div>

        {/* Total Expense Volume */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Processed
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {formatCurrency(stats.totalVolumeMinor, "SAR")}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Zero-loss integer ledger volume
          </p>
        </div>

        {/* Outstanding Unsettled */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Balances
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-400">
              {formatCurrency(stats.outstandingVolumeMinor, "SAR")}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            Awaiting debtor/creditor settle up
          </p>
        </div>
      </div>

      {/* Outbox & Notifications Telemetry Banner */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              Transactional Outbox Engine Active
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                {stats.outboxSuccessRate}% Deliverability
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Decoupled background worker processing Web Push (VAPID) and transactional notifications with zero duplicate charge risk.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
          <span className="text-slate-400">Queue:</span>
          <span className="bg-slate-800 px-2.5 py-1 rounded-md text-blue-400 border border-slate-700">
            {stats.outboxPending} pending jobs
          </span>
        </div>
      </div>

      {/* Two Column Grid: Recent Users & Recent Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" />
              Recent Registered Users
            </h2>
            <Link
              href="/admin/users"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              View All ({stats.totalUsers}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      user.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {user.status}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {user.totalExpensesCount} txns
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Groups Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-400" />
              Active Groups & Shared Flats
            </h2>
            <Link
              href="/admin/groups"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              View All ({stats.activeGroups}) →
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentGroups.map((group) => (
              <div
                key={group.id}
                className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
              >
                <div>
                  <div className="text-xs font-bold text-white">
                    {group.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Owner: {group.ownerName} · {group.membersCount} members
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-200">
                    {formatCurrency(group.totalExpensesMinor, group.currency)}
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {group.currency} Currency
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Audit Trail Highlights */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            Privileged Audit Log Activity
          </h2>
          <Link
            href="/admin/audit-logs"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Full Audit Trail →
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80">
          {recentLogs.map((log) => (
            <div
              key={log.id}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-[11px] text-amber-400 border border-slate-700">
                  {log.action}
                </span>
                <span className="text-slate-300 font-medium">
                  {log.details}
                </span>
              </div>
              <span className="text-slate-500 font-mono text-[11px] shrink-0">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
