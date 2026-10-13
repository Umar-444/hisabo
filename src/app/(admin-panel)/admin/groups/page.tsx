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
    <div className="space-y-6 max-w-6xl">
      {/* Header (Notion Workspace Title) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e3df]">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#e6e0f5] text-[#391c57] flex items-center justify-center shrink-0 border border-[#d6b6f6]">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] tracking-tight">
              Groups &amp; Shared Flats
            </h1>
            <p className="text-xs sm:text-sm text-[#787671] mt-0.5">
              Overview of roommate apartments, travel squads, and shared expense pools.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#f7f6f3] text-[#37352f] border border-[#e5e3df]">
            <span className="h-2 w-2 rounded-full bg-[#10B981]" />
            <span>{groups.length} active groups</span>
          </span>
        </div>
      </div>

      {/* Search Bar (Notion Database Control) */}
      <div className="relative max-w-md bg-white rounded-xl border border-[#e5e3df] shadow-xs">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#a4a097]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by group name or owner..."
          className="w-full rounded-xl border-0 bg-transparent pl-10 pr-4 py-2 text-xs sm:text-sm text-[#37352f] placeholder:text-[#a4a097] focus:outline-none focus:ring-0"
        />
      </div>

      {/* Groups Data Table (Notion Database Table) */}
      <div className="rounded-xl border border-[#e5e3df] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] border-b border-[#e5e3df] text-[11px] font-medium uppercase tracking-wider text-[#787671]">
              <tr>
                <th className="py-3 px-4">Group Name</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Total Expenses</th>
                <th className="py-3 px-4">Currency</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede9e4] text-[#37352f]">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#787671]">
                    No groups found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => (
                  <tr
                    key={group.id}
                    className="hover:bg-[#f7f6f3]/60 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#1a1a1a]">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[#7b3ff2]" />
                        {group.name}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <div className="text-[#1a1a1a] font-medium">{group.ownerName}</div>
                        <div className="text-[11px] text-[#787671] font-mono">
                          {group.ownerEmail}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 font-mono text-[#37352f] bg-[#f0eeec] px-2 py-0.5 rounded text-[11px] border border-[#e5e3df]">
                        <Users className="h-3 w-3 text-[#787671]" />
                        {group.membersCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold text-[#1a1a1a]">
                      {formatCurrency(group.totalExpensesMinor, group.currency)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] bg-[#dcecfa] text-[#005bab] px-2 py-0.5 rounded border border-[#b8dcfa] font-semibold">
                        {group.currency}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#787671]">
                      {group.createdAt}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#d9f3e1] text-[#0f5132] border border-[#b8e8c6]">
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

