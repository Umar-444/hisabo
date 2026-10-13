"use client";

import { useState } from "react";
import { initialAdminAuditLogs } from "@/features/admin/mock-data";
import { FileText, Search, ShieldCheck } from "lucide-react";

export function AdminAuditLogsClient() {
  const [logs] = useState(initialAdminAuditLogs);
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.targetId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header (Notion Workspace Title) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e3df]">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#ffe8d4] text-[#793400] flex items-center justify-center shrink-0 border border-[#fed0ab]">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] tracking-tight">
              Privileged Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-[#787671] mt-0.5">
              Immutable log of administrative interventions, user role changes, and ledger corrections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-[#f7f6f3] text-[#37352f] border border-[#e5e3df]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
            <span>{logs.length} logged events</span>
          </span>
        </div>
      </div>

      {/* Search Input (Notion Database Control) */}
      <div className="relative max-w-md bg-white rounded-xl border border-[#e5e3df] shadow-xs">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#a4a097]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action, target ID, or description..."
          className="w-full rounded-xl border-0 bg-transparent pl-10 pr-4 py-2 text-xs sm:text-sm text-[#37352f] placeholder:text-[#a4a097] focus:outline-none focus:ring-0"
        />
      </div>

      {/* Audit Logs Table (Notion Database Table) */}
      <div className="rounded-xl border border-[#e5e3df] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] border-b border-[#e5e3df] text-[11px] font-medium uppercase tracking-wider text-[#787671]">
              <tr>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Details &amp; Reason</th>
                <th className="py-3 px-4">Target Entity</th>
                <th className="py-3 px-4">Admin Actor</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede9e4] text-[#37352f]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#787671]">
                    No audit records found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#f7f6f3]/60 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-medium text-[#793400] bg-[#ffe8d4] px-2 py-0.5 rounded border border-[#fed0ab]">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <p className="text-[#1a1a1a] font-medium leading-relaxed">
                        {log.details}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#37352f]">
                      <span className="text-[#a4a097] uppercase text-[10px] block font-sans">
                        {log.targetType}
                      </span>
                      {log.targetId}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs font-semibold text-[#1a1a1a]">{log.actorName}</div>
                      <div className="text-[10px] text-[#787671] font-mono">
                        {log.actorEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#787671]">
                      {log.ipAddress}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-[#787671]">
                      {log.timestamp}
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
