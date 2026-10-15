"use client";

import { useState, useTransition } from "react";
import { confirmSettlementAction } from "@/features/settlements/actions";
import { Check, X, Loader2 } from "lucide-react";
import { RejectClaimModal } from "./reject-claim-modal";
import { toast } from "sonner";

interface Props {
  settlementId: string;
  payerName?: string;
  amount?: number;
  currency?: string;
}

export function SettlementActionButtonsClient({
  settlementId,
  payerName = "Debtor",
  amount = 0,
  currency = "SAR",
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const handleConfirm = () => {
    startTransition(async () => {
      const res = await confirmSettlementAction(settlementId);
      if (res.success) {
        toast.success(res.message || "Payment confirmed and ledger updated!");
      } else {
        toast.error(res.error || "Failed to confirm payment");
      }
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsRejectModalOpen(true)}
          disabled={isPending}
          className="px-2.5 py-1 rounded-lg border border-red-200 bg-white text-xs font-bold text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors cursor-pointer"
        >
          Reject
        </button>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isPending}
          className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer active:scale-95"
        >
          {isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Confirming...</span>
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              <span>Confirm Receipt</span>
            </>
          )}
        </button>
      </div>

      <RejectClaimModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        settlementId={settlementId}
        payerName={payerName}
        amount={amount}
        currency={currency}
      />
    </>
  );
}
