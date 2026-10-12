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
  Zap,
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
    <div className="rounded-[22px] border border-[#f5d0b5] bg-[#ffe8d4]/90 p-4 sm:p-5 shadow-xs space-y-3.5 transition-all">
      {/* Notion-style Top Banner Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#793400] text-white shadow-xs">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#523410] tracking-tight flex items-center gap-2">
              Action Required
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dd5b00]" />
              </span>
            </h2>
            <p className="text-[11px] font-medium text-[#793400]/80">
              {pendingList.length > 0
                ? `${pendingList.length} payment claim${pendingList.length > 1 ? "s" : ""} awaiting your confirmation`
                : "Active settlement reviews requiring your attention"}
            </p>
          </div>
        </div>

        <Link
          href="/settlements"
          className="text-[11px] font-bold text-[#793400] hover:text-[#523410] flex items-center gap-1 hover:underline"
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
              className="rounded-xl border border-[#f5d0b5] bg-white p-3.5 sm:p-4 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-[#e6e0f5] text-[#7b3ff2] font-black text-sm flex items-center justify-center shrink-0 border border-purple-200">
                    {st.payerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-[#1a1a1a] leading-snug">
                      <span className="text-[#185cff]">{st.payerName}</span> recorded a payment to you
                    </div>
                    <div className="text-xs text-[#787671] flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="font-semibold text-[#37352f]">{st.groupName}</span>
                      <span>·</span>
                      <span className="capitalize">{st.paymentMethod.replace("_", " ")}</span>
                      {st.note && (
                        <>
                          <span>·</span>
                          <span className="italic text-slate-500 truncate max-w-[150px]">
                            &ldquo;{st.note}&rdquo;
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black font-mono text-[#1a1a1a] tabular-nums">
                    {st.currency} {st.amountMajor.toFixed(2)}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#793400] bg-[#ffe8d4] px-2 py-0.5 rounded-md mt-0.5 border border-[#f5d0b5]">
                    <Clock className="h-2.5 w-2.5" />
                    Pending Confirmation
                  </span>
                </div>
              </div>

              {/* Inline Dispute Reason Form */}
              {isDisputingThis ? (
                <div className="pt-2 border-t border-[#e5e3df] space-y-2">
                  <label className="text-[11px] font-bold text-[#37352f]">
                    Why are you disputing this payment claim?
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="e.g. Did not receive transfer in bank, wrong amount..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full rounded-lg border border-red-300 bg-red-50/40 px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveDisputeId(null);
                        setDisputeReason("");
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#787671] hover:bg-[#f6f5f4] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isActing || !disputeReason.trim()}
                      onClick={() => handleDisputeSubmit(st.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#e03131] text-white text-xs font-bold hover:bg-red-700 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      {isActing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                      <span>Submit Dispute</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary Decision Buttons */
                <div className="flex items-center justify-between pt-1 border-t border-[#e5e3df] gap-2">
                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => {
                      setActiveDisputeId(st.id);
                      setDisputeReason("");
                    }}
                    className="px-3 py-1.5 rounded-lg border border-[#c8c4be] text-xs font-semibold text-[#37352f] hover:text-[#e03131] hover:border-red-300 hover:bg-red-50/50 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    Dispute claim
                  </button>

                  <button
                    type="button"
                    disabled={isActing}
                    onClick={() => handleConfirm(st.id)}
                    className="px-4 py-1.5 rounded-lg bg-[#185cff] hover:bg-[#1249d6] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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

        {/* Disputed Settlements Alert */}
        {disputes.map((dsp) => (
          <div
            key={dsp.id}
            className="flex items-center justify-between rounded-xl border border-red-200 bg-[#fde0ec] p-3 text-xs"
          >
            <div className="flex items-center gap-2 text-[#e03131] font-semibold">
              <AlertTriangle className="h-4 w-4 text-[#e03131] shrink-0" />
              <span>
                Payment of {dsp.currency} {dsp.amountMajor.toFixed(2)} with {dsp.payerName} is disputed
              </span>
            </div>
            <Link
              href="/settlements"
              className="font-bold text-[#e03131] hover:underline shrink-0"
            >
              Review
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
