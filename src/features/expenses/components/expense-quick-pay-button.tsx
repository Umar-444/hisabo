"use client";

import { useState } from "react";
import { QuickPaySheet } from "@/features/settlements/components/quick-pay-sheet";

interface Props {
  groupId: string;
  groupName: string;
  payeeId: string;
  payeeName: string;
  amount: number;
  currency: string;
}

export function ExpenseQuickPayButton({
  groupId,
  groupName,
  payeeId,
  payeeName,
  amount,
  currency,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 rounded-xl bg-[#185CFF] text-white text-xs font-bold hover:bg-[#1249D6] transition-colors shadow-2xs cursor-pointer active:scale-95"
      >
        Pay your share
      </button>

      <QuickPaySheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        groupId={groupId}
        groupName={groupName}
        payeeId={payeeId}
        payeeName={payeeName}
        outstandingAmount={amount}
        currency={currency}
      />
    </>
  );
}
