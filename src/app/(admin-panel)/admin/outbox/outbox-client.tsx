"use client";

import { useState, useTransition } from "react";
import { AdminOutboxEventRecord } from "@/features/admin/types";
import { flushOutboxQueueAction } from "@/features/admin/actions";
import {
  Radio,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  X,
  Terminal,
  Loader2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialEvents: AdminOutboxEventRecord[];
}

export function AdminOutboxClient({ initialEvents }: Props) {
  const [events, setEvents] = useState<AdminOutboxEventRecord[]>(initialEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inspectEvent, setInspectEvent] = useState<AdminOutboxEventRecord | null>(null);
  const [isFlushing, startFlush] = useTransition();

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.eventType.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ? true : e.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const completedCount = events.filter((e) => e.status === "completed").length;
  const pendingCount = events.filter((e) => e.status === "pending").length;
  const failedCount = events.filter((e) => e.status === "failed").length;

  const handleFlushQueue = () => {
    startFlush(async () => {
      const res = await flushOutboxQueueAction();
      if (res.success) {
        setEvents((prev) =>
          prev.map((e) => (e.status === "pending" || e.status === "failed" ? { ...e, status: "completed" } : e))
        );
        toast.success("All pending outbox events dispatched successfully.");
      } else {
        toast.error(res.error || "Failed to flush outbox queue.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header (Notion Workspace Title) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e3df]">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#d9f3e1] text-[#0f5132] flex items-center justify-center shrink-0 border border-[#b8e8c6]">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] tracking-tight">
              Transactional Outbox &amp; Delivery Tracing
            </h1>
            <p className="text-xs sm:text-sm text-[#787671] mt-0.5">
              Live diagnostics of push notifications, webhooks, and transactional delivery workers.
            </p>
          </div>
        </div>

        <button
          onClick={handleFlushQueue}
          disabled={isFlushing}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#185CFF] text-white text-xs font-medium hover:bg-blue-600 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
        >
          {isFlushing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Flushing...</span>
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" />
              <span>Flush Pending Queue</span>
            </>
          )}
        </button>
      </div>

      {/* Metrics Banner (Notion Pastel Metric Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#b8e8c6] bg-[#d9f3e1]/40 p-4.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#0f5132]">Successfully Processed</span>
            <div className="text-2xl font-bold text-[#0f5132] mt-0.5">{completedCount} Events</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white text-[#0f5132] border border-[#b8e8c6] flex items-center justify-center shadow-xs">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-[#b8dcfa] bg-[#dcecfa]/40 p-4.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#005bab]">Pending in Queue</span>
            <div className="text-2xl font-bold text-[#005bab] mt-0.5">{pendingCount} Waiting</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white text-[#005bab] border border-[#b8dcfa] flex items-center justify-center shadow-xs">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="rounded-xl border border-[#fed0ab] bg-[#ffe8d4]/40 p-4.5 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-[#793400]">Failed / Dead-Letter</span>
            <div className="text-2xl font-bold text-[#793400] mt-0.5">{failedCount} Failures</div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white text-[#793400] border border-[#fed0ab] flex items-center justify-center shadow-xs">
            <AlertTriangle className="h-5 w-5" />
          </div>
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
            placeholder="Search by event ID or event type..."
            className="w-full rounded-xl border-0 bg-transparent pl-9 pr-4 py-1.5 text-xs sm:text-sm text-[#37352f] placeholder:text-[#a4a097] focus:outline-none focus:ring-0"
          />
        </div>

        <div className="flex items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ede9e4]">
          {["all", "completed", "pending", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize ${
                statusFilter === st
                  ? "bg-[#1a1a1a] text-white"
                  : "bg-transparent text-[#787671] hover:bg-[#f7f6f3] hover:text-[#1a1a1a]"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Outbox Events Table (Notion Database Table) */}
      <div className="rounded-xl border border-[#e5e3df] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafaf9] border-b border-[#e5e3df] text-[11px] font-medium uppercase tracking-wider text-[#787671]">
              <tr>
                <th className="py-3 px-4">Event ID</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Delivery Status</th>
                <th className="py-3 px-4">Attempts</th>
                <th className="py-3 px-4">Created Time</th>
                <th className="py-3 px-4">Processed Time</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede9e4] text-[#37352f]">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#787671]">
                    No outbox events found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-[#f7f6f3]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[#1a1a1a]">
                      {evt.id}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#005bab]">
                      {evt.eventType}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium ${
                          evt.status === "completed"
                            ? "bg-[#d9f3e1] text-[#0f5132] border border-[#b8e8c6]"
                            : evt.status === "pending"
                            ? "bg-[#dcecfa] text-[#005bab] border border-[#b8dcfa]"
                            : "bg-[#fde0ec] text-[#a02e6d] border border-[#f8b4d0]"
                        }`}
                      >
                        {evt.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                        {evt.status === "pending" && <Clock className="h-3 w-3" />}
                        {evt.status === "failed" && <AlertTriangle className="h-3 w-3" />}
                        {evt.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-center sm:text-left text-[#787671]">
                      {evt.attempts}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#787671]">
                      {evt.createdAt}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#787671]">
                      {evt.processedAt || "—"}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setInspectEvent(evt)}
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

      {/* Payload Inspector Modal */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-xl bg-white border border-[#e5e3df] p-6 shadow-xl relative">
            <button
              onClick={() => setInspectEvent(null)}
              className="absolute right-4 top-4 text-[#787671] hover:text-[#1a1a1a] cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Terminal className="h-5 w-5 text-[#185CFF]" />
              <h3 className="text-base font-semibold text-[#1a1a1a]">
                Outbox Delivery Payload Inspector
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#fafaf9] p-3 rounded-lg border border-[#e5e3df] space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#787671]">Event ID:</span>
                  <span className="text-[#1a1a1a] font-bold">{inspectEvent.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787671]">Event Type:</span>
                  <span className="text-[#005bab] font-bold">{inspectEvent.eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787671]">Delivery Status:</span>
                  <span className="text-[#0f5132] font-bold">{inspectEvent.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#787671]">Created At:</span>
                  <span className="text-[#1a1a1a]">{inspectEvent.createdAt}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#787671] uppercase tracking-wider mb-1">
                  Message Body &amp; Metadata
                </label>
                <div className="bg-[#0a1530] text-[#dcecfa] p-3.5 rounded-lg font-mono text-xs overflow-x-auto max-h-60 leading-relaxed">
                  {JSON.stringify(inspectEvent.payload, null, 2)}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setInspectEvent(null)}
                className="px-4 py-1.5 rounded-lg bg-[#f0eeec] text-[#37352f] hover:bg-[#e5e3df] text-xs font-medium cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
