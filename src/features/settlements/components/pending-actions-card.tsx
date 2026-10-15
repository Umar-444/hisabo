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
import { RejectClaimModal } from "./reject-claim-modal";

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
  const [rejectingSettlement, setRejectingSettlement] = useState<SerializedPendingAction | null>(null);
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

  const totalActions = pendingList.length + disputes.length;

  if (totalActions === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-[#f9e79f] bg-[#fef7d6] p-4 sm:p-4.5 shadow-2xs space-y-3 transition-all">
      {/* Top Banner Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#dd5b00] text-white shadow-2xs">
            <BellRing className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-[#523410] uppercase tracking-wider flex items-center gap-2">
              Action Required
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#dd5b00] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#dd5b00]" />
              </span>
            </h2>
            <p className="text-[11px] text-[#793400] font-normal">
              {pendingList.length > 0
                ? `${pendingList.length} payment claim${pendingList.length > 1 ? "s" : ""} awaiting your confirmation`
                : "Active settlement reviews requiring your attention"}
            </p>
          </div>
        </div>

        <Link
          href="/settlements"
          className="text-[11px] font-semibold text-[#793400] hover:text-[#523410] flex items-center gap-1 hover:underline"
        >
          <span>Settlements</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Pending Settlement Claims List */}
      <div className="space-y-2">
        {pendingList.map((st) => {
          const isActing = actionInProgressId === st.id && isPending;

          return (
            <div
              key={st.id}
              className="rounded-lg border border-[#f5d0b5] bg-white p-3.5 shadow-2xs space-y-2.5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-[#ffe8d4] text-[#793400] font-bold text-xs flex items-center justify-center shrink-0 border border-[#f5d0b5]">
                    {st.payerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#1a1a1a] leading-snug">
                      <span className="text-[#185CFF]">{st.payerName}</span> recorded a payment to you
                    </div>
                    <div className="text-[11px] text-[#787671] flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="font-medium text-[#37352f]">{st.groupName}</span>
                      <span>·</span>
                      <span className="capitalize">{st.paymentMethod.replace("_", " ")}</span>
                      {st.note && (
                        <>
                          <span>·</span>
                          <span className="italic text-[#787671] truncate max-w-[150px]">
                            &ldquo;{st.note}&rdquo;
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono text-[#1a1a1a] tabular-nums">
                    {st.currency} {st.amountMajor.toFixed(2)}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-[#793400] bg-[#ffe8d4] px-1.5 py-0.5 rounded-sm mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    Unconfirmed
                  </span>
                </div>
              </div>

              {/* Primary Decision Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-[#ede9e4] gap-2">
                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => setRejectingSettlement(st)}
                  className="px-2.5 py-1 rounded-md border border-[#c8c4be] text-xs font-medium text-[#787671] hover:text-[#EF4444] hover:border-red-300 hover:bg-red-50/30 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Reject claim
                </button>

                <button
                  type="button"
                  disabled={isActing}
                  onClick={() => handleConfirm(st.id)}
                  className="px-3.5 py-1 rounded-md bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {isActing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Check className="h-3 w-3 stroke-[2.5]" />
                  )}
                  <span>Confirm Receipt</span>
                </button>
              </div>
            </div>
          );
        })}

        {/* Disputed Settlements Alert if any */}
        {disputes.map((dsp) => (
          <div
            key={dsp.id}
            className="flex items-center justify-between rounded-lg border border-[#f5b8d0] bg-[#fde0ec] p-2.5 text-xs"
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

      {rejectingSettlement && (
        <RejectClaimModal
          isOpen={true}
          onClose={() => setRejectingSettlement(null)}
          settlementId={rejectingSettlement.id}
          payerName={rejectingSettlement.payerName}
          amount={rejectingSettlement.amountMajor}
          currency={rejectingSettlement.currency}
          onSuccess={() => {
            setPendingList((prev) => prev.filter((item) => item.id !== rejectingSettlement.id));
            setRejectingSettlement(null);
          }}
        />
      )}
    </div>
  );
}
