"use client";

import { useState, useTransition } from "react";
import {
  confirmSettlementAction,
  disputeSettlementAction,
} from "@/features/settlements/actions";
import {
  BellRing,
  Check,
  X,
  AlertTriangle,
  Loader2,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export interface SerializedPendingAction {
  id: string;
  groupId: string;
  groupName: string;
  payerId: string;
  payerName: string;
  payerUsername: string;
  payeeId: string;
  payeeName: string;
  amountMajor: number;
  currency: string;
  status: string;
  paymentMethod: string;
  note: string | null;
  createdAt: string;
}

interface PendingActionsCardProps {
  pendingSettlements: SerializedPendingAction[];
  disputes?: SerializedPendingAction[];
}

export function PendingActionsCard({
  pendingSettlements: initialPending,
  disputes = [],
}: PendingActionsCardProps) {
  const [pendingList, setPendingList] = useState<SerializedPendingAction[]>(initialPending);
  const [activeDisputeId, setActiveDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = (settlementId: string) => {
    setActionInProgressId(settlementId);
    startTransition(async () => {
      const res = await confirmSettlementAction(settlementId);
      setActionInProgressId(null);
      if (res.success) {
        toast.success(res.message || "Payment confirmed and balance cleared!");
        setPendingList((prev) => prev.filter((item) => item.id !== settlementId));
      } else {
        toast.error(res.error || "Failed to confirm payment");
      }
    });
  };

  const handleDisputeSubmit = (settlementId: string) => {
    if (!disputeReason.trim()) {
      toast.error("Please provide a reason for disputing this payment");
      return;
    }

    setActionInProgressId(settlementId);
    startTransition(async () => {
      const res = await disputeSettlementAction(settlementId, disputeReason.trim());
      setActionInProgressId(null);
      setActiveDisputeId(null);
      setDisputeReason("");
      if (res.success) {
        toast.info(res.message || "Settlement marked as disputed");
        setPendingList((prev) => prev.filter((item) => item.id !== settlementId));
      } else {
        toast.error(res.error || "Failed to dispute settlement");
      }
    });
  };

  const totalActions = pendingList.length + disputes.length;

  if (totalActions === 0) {
    return null;
  }

  return (
    <div className="rounded-[22px] border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/90 via-amber-50/50 to-orange-50/30 p-4 sm:p-5 shadow-sm space-y-3.5 transition-all animate-in fade-in slide-in-from-top-2">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs shadow-amber-500/30">
            <BellRing className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              Action Required
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>
            </h2>
            <p className="text-[11px] font-medium text-amber-900/80">
              {pendingList.length > 0
                ? `${pendingList.length} payment claim${pendingList.length > 1 ? "s" : ""} awaiting your confirmation`
                : "Active settlement reviews requiring your attention"}
            </p>
          </div>
        </div>

        <Link
          href="/settlements"
          className="text-[11px] font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 hover:underline"
        >
          <span>Settlements</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Pending Settlement Claims List */}
      <div className="space-y-2.5">
        {pendingList.map((st) => {
          const isActing = actionInProgressId === st.id && isPending;
          const isDisputingThis = activeDisputeId === st.id;

          return (
            <div
              key={st.id}
              className="rounded-2xl border border-amber-200/90 bg-white/95 p-3.5 sm:p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-800 font-black text-sm flex items-center justify-center shrink-0 border border-amber-200">
                    {st.payerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#0F172A] leading-snug">
                      <span className="text-blue-600">{st.payerName}</span> recorded a payment to you
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="font-medium text-slate-700">{st.groupName}</span>
                      <span>·</span>
                      <span className="capitalize">{st.paymentMethod.replace("_", " ")}</span>
                      {st.note && (
                        <>
                          <span>·</span>
                          <span className="italic text-slate-600 truncate max-w-[150px]">
                            &ldquo;{st.note}&rdquo;
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black font-mono text-[#0F172A] tabular-nums">
                    {st.currency} {st.amountMajor.toFixed(2)}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    Unconfirmed
                  </span>
                </div>
              </div>

              {/* Inline Dispute Reason Form */}
              {isDisputingThis ? (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="text-[11px] font-bold text-slate-700">
                    Why are you disputing this payment claim?
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Did not receive transfer in bank, wrong amount..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full rounded-xl border border-red-300 bg-red-50/40 px-3 py-2 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDisputeId(null);
                        setDisputeReason("");
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isActing || !disputeReason.trim()}
                      onClick={() => handleDisputeSubmit(st.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      <span>Submit Dispute</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Decision Buttons */
                <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 gap-2">
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => {
                      setActiveDisputeId(st.id);
                      setDisputeReason("");
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Dispute claim
                  </button>

                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => handleConfirm(st.id)}
                    className="px-4 py-1.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold shadow-xs shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {isActing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5 stroke-[3]" />
                    )}
                    <span>Confirm Receipt</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Disputed Settlements Alert if any */}
        {disputes.map((dsp) => (
          <div
            key={dsp.id}
            className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs"
          >
            <div className="flex items-center gap-2 text-red-800 font-semibold">
              <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
              <span>
                Payment of {dsp.currency} {dsp.amountMajor.toFixed(2)} with {dsp.payerName} is disputed
              </span>
            </div>
            <Link
              href="/settlements"
              className="font-bold text-red-700 hover:underline shrink-0"
            >
              Review
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
