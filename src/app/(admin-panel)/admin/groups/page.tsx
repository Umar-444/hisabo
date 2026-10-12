"use client";

import { useState } from "react";
import { initialAdminGroups } from "@/features/admin/mock-data";
import { formatCurrency } from "@/lib/money";
import { Building2, Search, Users, CheckCircle2 } from "lucide-react";

export default function AdminGroupsPage() {
  const [groups] = useState(initialAdminGroups);
  const [search, setSearch] = useState("");

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-purple-400" />
            Groups &amp; Shared Flats
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Overview of roommate apartments, travel squads, and shared expense pools
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          Active Groups: <strong className="text-white">{groups.length}</strong>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by group name or owner..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#185CFF] focus:outline-none focus:ring-1 focus:ring-[#185CFF]"
        />
      </div>

      {/* Groups Data Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Group Name</th>
                <th className="py-3.5 px-4">Owner</th>
                <th className="py-3.5 px-4">Members</th>
                <th className="py-3.5 px-4">Total Expenses</th>
                <th className="py-3.5 px-4">Currency</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No groups found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => (
                  <tr
                    key={group.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-purple-400" />
                        {group.name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="text-white font-medium">{group.ownerName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {group.ownerEmail}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                        <Users className="h-3 w-3 text-slate-400" />
                        {group.membersCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-200">
                      {formatCurrency(group.totalExpensesMinor, group.currency)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-bold">
                        {group.currency}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {group.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="h-3 w-3" />
                        {group.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
