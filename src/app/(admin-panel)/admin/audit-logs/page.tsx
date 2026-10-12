"use client";

import { useState } from "react";
import { initialAdminAuditLogs } from "@/features/admin/mock-data";
import { FileText, Search } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs] = useState(initialAdminAuditLogs);
  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.targetId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <FileText className="h-6 w-6 text-amber-400" />
            Privileged Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of administrative interventions, user role changes, and ledger corrections
          </p>
        </div>

        <div className="text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
          Total Recorded Actions: <strong className="text-white">{logs.length}</strong>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action, target ID, or description..."
          className="w-full rounded-xl border border-slate-800 bg-slate-900/90 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:border-[#185CFF] focus:outline-none focus:ring-1 focus:ring-[#185CFF]"
        />
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Action Type</th>
                <th className="py-3.5 px-4">Details &amp; Reason</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Admin Actor</th>
                <th className="py-3.5 px-4">IP Address</th>
                <th className="py-3.5 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No audit records found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs sm:max-w-md">
                      <p className="text-white font-medium leading-relaxed">
                        {log.details}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      <span className="text-slate-500 uppercase text-[10px] block">
                        {log.targetType}
                      </span>
                      {log.targetId}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-white">{log.actorName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {log.actorEmail}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {log.ipAddress}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[11px] text-slate-400">
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
