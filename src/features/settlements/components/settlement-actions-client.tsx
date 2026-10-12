"use client";

import { useTransition } from "react";
import { confirmSettlementAction, disputeSettlementAction } from "@/features/settlements/actions";
import { Check, X } from "lucide-react";

export function SettlementActionButtonsClient({ settlementId }: { settlementId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await confirmSettlementAction(settlementId);
    });
  };

  const handleDispute = () => {
    const reason = window.prompt("Reason for disputing this settlement payment:");
    if (!reason) return;

    startTransition(async () => {
      await disputeSettlementAction(settlementId, reason);
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDispute}
        disabled={isPending}
        className="px-2.5 py-1 rounded-lg border border-red-200 bg-white text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
      >
        Dispute
      </button>

      <button
        onClick={handleConfirm}
        disabled={isPending}
        className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1 shadow-xs transition-colors"
      >
        <Check className="h-3.5 w-3.5 stroke-[3]" />
        <span>Confirm Receipt</span>
      </button>
    </div>
  );
}
