"use client";

import { useState, useTransition, useId } from "react";
import { quickPaySettlementAction } from "@/features/settlements/actions";
import {
  X,
  CreditCard,
  Banknote,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface QuickPaySheetProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  payeeId: string;
  payeeName: string;
  outstandingAmount: number;
  currency: string;
  defaultPaymentMethod?: "bank_transfer" | "cash" | "other";
  requestedBy?: string;
  onSuccess?: () => void;
}

const PAYMENT_METHODS = [
  {
    id: "bank_transfer" as const,
    label: "Bank Transfer / STC Pay",
    icon: CreditCard,
  },
  {
    id: "cash" as const,
    label: "Cash in Person",
    icon: Banknote,
  },
  {
    id: "other" as const,
    label: "Other Channel",
    icon: Send,
  },
];

export function QuickPaySheet({
  isOpen,
  onClose,
  groupId,
  groupName,
  payeeId,
  payeeName,
  outstandingAmount,
  currency,
  defaultPaymentMethod = "bank_transfer",
  requestedBy,
  onSuccess,
}: QuickPaySheetProps) {
  const [amountStr, setAmountStr] = useState(outstandingAmount.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cash" | "other">(
    defaultPaymentMethod
  );
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  // Generate unique idempotency key per modal session
  const [idempotencyKey] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? `quickpay-${crypto.randomUUID()}`
      : `quickpay-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  );

  if (!isOpen) return null;

  const parsedAmount = parseFloat(amountStr) || 0;
  const isCappedExceeded = parsedAmount > outstandingAmount + 0.001;
  const isZeroOrNegative = parsedAmount <= 0;
  const isValid = !isCappedExceeded && !isZeroOrNegative;
  const remainingAfterPayment = Math.max(0, outstandingAmount - parsedAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isPending) return;

    startTransition(async () => {
      const res = await quickPaySettlementAction({
        groupId,
        payeeId,
        amount: parsedAmount,
        currency,
        paymentMethod,
        note: note.trim() || undefined,
        idempotencyKey,
        requestedBy,
      });

      if (res.success) {
        toast.success(
          res.message || "Payment claim recorded! Waiting for confirmation."
        );
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.error || "Failed to record payment");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#185CFF]">
              Quick Pay Settlement
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Pay <span className="text-[#185CFF]">{payeeName}</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Outstanding Balance Banner */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-500">
                Outstanding Balance in {groupName}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">
                Full amount owed:
              </div>
            </div>
            <div className="text-base font-black font-mono text-slate-900 tabular-nums">
              {currency} {outstandingAmount.toFixed(2)}
            </div>
          </div>

          {/* Amount Input with Downward-only rule */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Amount ({currency})
              </label>
              <button
                type="button"
                onClick={() => setAmountStr(outstandingAmount.toFixed(2))}
                className="text-[11px] font-bold text-[#185CFF] hover:underline cursor-pointer"
              >
                Pay Full Amount
              </button>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max={outstandingAmount}
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                required
                className={`w-full rounded-xl border pl-14 pr-4 py-2.5 text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                  isCappedExceeded
                    ? "border-red-400 bg-red-50/40 text-red-900 focus:ring-red-400"
                    : "border-slate-200 bg-white focus:ring-[#185CFF] focus:border-[#185CFF]"
                }`}
              />
            </div>

            {isCappedExceeded && (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-600 mt-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>
                  Amount cannot exceed outstanding balance ({currency}{" "}
                  {outstandingAmount.toFixed(2)}).
                </span>
              </div>
            )}

            {!isCappedExceeded && parsedAmount > 0 && parsedAmount < outstandingAmount && (
              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80">
                Partial payment: {currency} {remainingAfterPayment.toFixed(2)}{" "}
                will remain owed.
              </div>
            )}
          </div>

          {/* Method Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Payment Method
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PAYMENT_METHODS.map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#185CFF] bg-[#185CFF]/5 text-[#185CFF] ring-1 ring-[#185CFF]"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4" />
                      <span>{m.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="h-4 w-4 text-[#185CFF]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional Note */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Optional Note
            </label>
            <input
              type="text"
              maxLength={100}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Sent via STC Pay..."
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#185CFF] focus:border-[#185CFF]"
            />
          </div>

          {/* Invariant Explanation */}
          <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            Note: Recording this payment creates a <span className="font-semibold text-slate-700">PENDING</span> claim. Your balance will be marked settled as soon as {payeeName} confirms receipt.
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || isPending}
            className="w-full py-3 rounded-xl bg-[#185CFF] text-white text-xs font-bold hover:bg-[#1249D6] shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Recording Payment...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>Mark as Paid ({currency} {isValid ? parsedAmount.toFixed(2) : "0.00"})</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
