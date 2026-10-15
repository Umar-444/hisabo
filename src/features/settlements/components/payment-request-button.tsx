"use client";

import { useState, useTransition } from "react";
import { requestPaymentAction } from "@/features/settlements/actions";
import { Clock, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentRequestButtonProps {
  groupId: string;
  debtorId: string;
  debtorName: string;
  amount: number;
  currency: string;
  expenseId?: string;
  lastRequestedAt?: Date | string | null;
  size?: "sm" | "md";
}

export function PaymentRequestButton({
  groupId,
  debtorId,
  debtorName,
  amount,
  currency,
  expenseId,
  lastRequestedAt: initialLastRequestedAt,
  size = "sm",
}: PaymentRequestButtonProps) {
  const [lastRequestedAt, setLastRequestedAt] = useState<Date | null>(
    initialLastRequestedAt ? new Date(initialLastRequestedAt) : null
  );
  const [isPending, startTransition] = useTransition();

  // Check 24h cooldown
  const now = Date.now();
  const cooldownDuration = 24 * 60 * 60 * 1000;
  const isCooldownActive =
    lastRequestedAt !== null && now - lastRequestedAt.getTime() < cooldownDuration;

  let cooldownLabel = "";
  if (isCooldownActive && lastRequestedAt) {
    const elapsedMs = now - lastRequestedAt.getTime();
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    if (elapsedHours < 1) {
      cooldownLabel = "Requested recently";
    } else {
      cooldownLabel = `Requested ${elapsedHours}h ago`;
    }
  }

  const handleRequest = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isCooldownActive || isPending) return;

    startTransition(async () => {
      const res = await requestPaymentAction({
        groupId,
        debtorId,
        amount,
        currency,
        expenseId,
      });

      if (res.success) {
        toast.success(res.message || `Payment requested from ${debtorName}`);
        setLastRequestedAt(new Date());
      } else {
        toast.error(res.error || "Failed to request payment");
      }
    });
  };

  if (isCooldownActive) {
    return (
      <span
        title={`Payment already requested within the last 24h. Debtor received a notification.`}
        className={`inline-flex items-center gap-1.5 font-medium rounded-lg bg-slate-100 text-slate-500 border border-slate-200/80 cursor-not-allowed select-none ${
          size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
        }`}
      >
        <Clock className="h-3 w-3 shrink-0 text-slate-400" />
        <span>{cooldownLabel}</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleRequest}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 font-bold rounded-lg bg-white border border-[#185CFF]/30 text-[#185CFF] hover:bg-[#185CFF]/10 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-50 ${
        size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
      }`}
    >
      {isPending ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin shrink-0" />
          <span>Requesting...</span>
        </>
      ) : (
        <>
          <Send className="h-3 w-3 shrink-0" />
          <span>Request</span>
        </>
      )}
    </button>
  );
}
