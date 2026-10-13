"use client";

import { useState } from "react";
import { AdminAuditLogRecord } from "@/features/admin/types";
import { FileText, Search, ShieldCheck, X, Eye, Clock, Terminal } from "lucide-react";

interface Props {
  initialLogs: AdminAuditLogRecord[];
}

export function AdminAuditLogsClient({ initialLogs }: Props) {
  const [logs] = useState<AdminAuditLogRecord[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [inspectLog, setInspectLog] = useState<AdminAuditLogRecord | null>(null);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.targetId.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "all"
        ? true
        : categoryFilter === "currency"
          ? l.action.includes("CURRENCY")
          : categoryFilter === "user"
            ? l.action.includes("USER")
            : categoryFilter === "flags"
              ? l.action.includes("FLAGS") || l.action.includes("ANNOUNCEMENT")
              : true;

    return matchesSearch && matchesCategory;
  });

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
              Privileged Audit Trail &amp; Tracing
            </h1>
            <p className="text-xs sm:text-sm text-[#787671] mt-0.5">
              Immutable live audit record of administrative interventions, feature flag updates, and ledger corrections.
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

      {/* Filter and Search Controls (Notion Database Controls) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-[#e5e3df] shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#a4a097]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, target ID, trace ID, or details..."
            className="w-full rounded-xl border-0 bg-transparent pl-9 pr-4 py-1.5 text-xs sm:text-sm text-[#37352f] placeholder:text-[#a4a097] focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ede9e4]">
          {[
            { id: "all", label: "All" },
            { id: "currency", label: "Currencies" },
            { id: "user", label: "Users" },
            { id: "flags", label: "Flags & Config" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${categoryFilter === cat.id
                ? "bg-[#1a1a1a] text-white"
                : "bg-transparent text-[#787671] hover:bg-[#f7f6f3] hover:text-[#1a1a1a]"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
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
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Inspect</th>
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
                      <p className="text-[#1a1a1a] font-medium leading-relaxed truncate">
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
                      {log.timestamp}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-[#185CFF] hover:bg-[#dcecfa]/50 transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspector Modal (Notion Dialog) */}
      {inspectLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-white border border-[#e5e3df] p-6 shadow-xl relative">
            <button
              onClick={() => setInspectLog(null)}
              className="absolute right-4 top-4 text-[#787671] hover:text-[#1a1a1a] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Terminal className="h-5 w-5 text-[#185CFF]" />
              <h3 className="text-base font-semibold text-[#1a1a1a]">
                Audit Event Trace Inspector
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#fafaf9] p-3 rounded-lg border border-[#e5e3df] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#787671]">Trace ID:</span>
                  <span className="text-[#1a1a1a] font-bold">{inspectLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787671]">Action:</span>
                  <span className="text-[#793400] font-bold">{inspectLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787671]">Actor:</span>
                  <span className="text-[#1a1a1a]">{inspectLog.actorEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787671]">IP Address:</span>
                  <span className="text-[#1a1a1a]">{inspectLog.ipAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787671]">Timestamp:</span>
                  <span className="text-[#1a1a1a]">{inspectLog.timestamp}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#787671] uppercase tracking-wider mb-1">
                  Event Payload &amp; Details
                </label>
                <div className="bg-[#0a1530] text-[#dcecfa] p-3.5 rounded-lg font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                  {(() => {
                    try {
                      const parsed = JSON.parse(inspectLog.details);
                      return JSON.stringify(parsed, null, 2);
                    } catch {
                      return inspectLog.details;
                    }
                  })()}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-1.5 rounded-lg bg-[#f0eeec] text-[#37352f] hover:bg-[#e5e3df] text-xs font-medium cursor-pointer"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
