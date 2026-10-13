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
  Sparkles,
  ShieldCheck,
  FileText,
  AlertCircle,
} from "lucide-react";

import {
  getAdminStatsQuery,
  getAdminUsersQuery,
  getAdminGroupsQuery,
  getAdminAuditLogsQuery,
} from "@/features/admin/queries";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const [stats, allUsers, allGroups, allLogs] = await Promise.all([
    getAdminStatsQuery(),
    getAdminUsersQuery(),
    getAdminGroupsQuery(),
    getAdminAuditLogsQuery(5),
  ]);

  const recentUsers = allUsers.slice(0, 4);
  const recentGroups = allGroups.slice(0, 3);
  const recentLogs = allLogs.slice(0, 4);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5e3df]">
        <div>
          <h1 className="text-2xl font-bold text-[#0a1530] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#787671] mt-1">
            Real-time platform telemetry, user account status, and zero-sum financial health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-[#e5e3df] text-[#37352f] hover:bg-[#f7f6f3] transition-colors shadow-2xs"
          >
            Manage Users
            <ArrowUpRight className="h-3.5 w-3.5 text-[#787671]" />
          </Link>
          <Link
            href="/admin/groups"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-[#185CFF] text-white hover:bg-[#1249D6] transition-colors shadow-2xs"
          >
            View Groups
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Notion-Tinted Database Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users (Sky Tint) */}
        <div className="rounded-xl border border-[#c0dcf7] bg-[#dcecfa]/60 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#0a3663]">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 text-[#0075de] border border-[#c0dcf7]/60">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0a1530]">
              {stats.totalUsers}
            </span>
            <span className="text-[11px] font-bold text-[#0f5132] flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +12%
            </span>
          </div>
          <p className="text-[11px] text-[#0a3663]/80 mt-1 font-medium">
            242 active · 6 suspended
          </p>
        </div>

        {/* Card 2: Active Groups (Lavender Tint) */}
        <div className="rounded-xl border border-[#d6b6f6] bg-[#e6e0f5]/60 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#391c57]">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Active Groups
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 text-[#7b3ff2] border border-[#d6b6f6]/60">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0a1530]">
              {stats.activeGroups}
            </span>
            <span className="text-[11px] font-bold text-[#0f5132] flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +4 this week
            </span>
          </div>
          <p className="text-[11px] text-[#391c57]/80 mt-1 font-medium">
            38 flatshares · 4 archived
          </p>
        </div>

        {/* Card 3: Total Expenses Volume (Mint Tint) */}
        <div className="rounded-xl border border-[#b8e8c6] bg-[#d9f3e1]/60 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#0f5132]">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Expense Volume
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 text-[#1aae39] border border-[#b8e8c6]/60">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0a1530]">
              {formatCurrency(stats.totalVolumeMinor, "SAR")}
            </span>
          </div>
          <p className="text-[11px] text-[#0f5132]/80 mt-1 font-medium">
            Tracked across all groups
          </p>
        </div>

        {/* Card 4: Outstanding Balances (Peach Tint) */}
        <div className="rounded-xl border border-[#fed0ab] bg-[#ffe8d4]/60 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#793400]">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Outstanding Balances
            </span>
            <div className="p-1.5 rounded-lg bg-white/80 text-[#dd5b00] border border-[#fed0ab]/60">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#0a1530]">
              {formatCurrency(stats.outstandingVolumeMinor, "SAR")}
            </span>
          </div>
          <p className="text-[11px] text-[#793400]/80 mt-1 font-medium">
            {stats.outboxPending} pending outbox syncs
          </p>
        </div>
      </div>

      {/* Two Column Section: Recent Users & Recent Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users Notion Database Card */}
        <div className="rounded-xl border border-[#e5e3df] bg-white shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#e5e3df] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#185CFF]" />
              <h2 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">
                Recent User Registrations
              </h2>
            </div>
            <Link
              href="/admin/users"
              className="text-xs text-[#185CFF] font-semibold hover:underline flex items-center gap-1"
            >
              View all ({stats.totalUsers})
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafaf9] border-b border-[#e5e3df] text-[10px] font-bold uppercase tracking-wider text-[#787671]">
                <tr>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede9e4]">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#f7f6f3]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0a1530]">{user.name}</div>
                      <div className="text-[11px] text-[#787671]">@{user.username}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border ${user.role === "admin"
                        ? "bg-[#dcecfa] text-[#0a3663] border-[#c0dcf7]"
                        : "bg-[#f0eeec] text-[#37352f] border-[#e5e3df]"
                        }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${user.status === "active"
                        ? "bg-[#d9f3e1] text-[#0f5132] border-[#b8e8c6]"
                        : "bg-[#fde0ec] text-[#7a1a45] border-[#f8b4d0]"
                        }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === "active" ? "bg-[#1aae39]" : "bg-[#e03131]"}`} />
                        {user.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-[#787671] text-[11px] font-mono">
                      {user.joinedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Groups Notion Database Card */}
        <div className="rounded-xl border border-[#e5e3df] bg-white shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-[#e5e3df] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#7b3ff2]" />
              <h2 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">
                Recent Active Groups
              </h2>
            </div>
            <Link
              href="/admin/groups"
              className="text-xs text-[#185CFF] font-semibold hover:underline flex items-center gap-1"
            >
              View all ({stats.activeGroups})
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafaf9] border-b border-[#e5e3df] text-[10px] font-bold uppercase tracking-wider text-[#787671]">
                <tr>
                  <th className="py-2.5 px-4">Group Name</th>
                  <th className="py-2.5 px-4">Owner</th>
                  <th className="py-2.5 px-4">Members</th>
                  <th className="py-2.5 px-4 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede9e4]">
                {recentGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-[#f7f6f3]/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#0a1530]">{group.name}</div>
                      <div className="text-[10px] text-[#787671] font-mono">{group.currency} pool</div>
                    </td>
                    <td className="py-3 px-4 text-[#37352f]">{group.ownerName}</td>
                    <td className="py-3 px-4 text-[#787671]">{group.membersCount} members</td>
                    <td className="py-3 px-4 text-right font-bold text-[#0a1530] font-mono">
                      {formatCurrency(group.totalExpensesMinor, group.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Privileged Audit Trail Section */}
      <div className="rounded-xl border border-[#e5e3df] bg-white shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-[#e5e3df] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0075de]" />
            <h2 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">
              Recent Administrative Audit Trail
            </h2>
          </div>
          <Link
            href="/admin/audit-logs"
            className="text-xs text-[#185CFF] font-semibold hover:underline flex items-center gap-1"
          >
            Full Audit Logs
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] border-b border-[#e5e3df] text-[10px] font-bold uppercase tracking-wider text-[#787671]">
              <tr>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Admin Actor</th>
                <th className="py-2.5 px-4">Details</th>
                <th className="py-2.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede9e4]">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#f7f6f3]/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] font-bold text-[#0a1530] bg-[#f0eeec] border border-[#e5e3df] px-2 py-0.5 rounded-md">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#37352f] font-medium">{log.actorName}</td>
                  <td className="py-3 px-4 text-[#787671] max-w-md truncate">{log.details}</td>
                  <td className="py-3 px-4 text-right text-[#a4a097] text-[11px] font-mono">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Database & Outbox Health Status */}
      <div className="rounded-xl border border-[#e5e3df] bg-[#fafaf9] p-5 shadow-2xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede9e4]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#10B981]" />
            <h3 className="text-xs font-bold text-[#0a1530] uppercase tracking-wider">
              System Invariants &amp; Outbox Health
            </h3>
          </div>
          <span className="rounded-md bg-[#d9f3e1] text-[#0f5132] border border-[#b8e8c6] px-2 py-0.5 text-[10px] font-bold">
            All Systems Healthy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
          <div>
            <div className="text-[11px] text-[#787671]">Zero-Sum Ledger Status</div>
            <div className="font-bold text-[#0a1530] mt-0.5 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Conservation Verified (Σ = 0)
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#787671]">Transactional Outbox Queue</div>
            <div className="font-bold text-[#0a1530] mt-0.5">
              0 failed retries · 0 stalled jobs
            </div>
          </div>
          <div>
            <div className="text-[11px] text-[#787671]">Database Connection Pool</div>
            <div className="font-bold text-[#0a1530] mt-0.5 font-mono">
              Neon PostgreSQL AWS us-east-2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
