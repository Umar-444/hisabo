"use client";

import { useState, useTransition } from "react";
import { rejectSettlementAction } from "@/features/settlements/actions";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RejectClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlementId: string;
  payerName: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
}

const REJECTION_REASONS = [
  { id: "Not received", label: "Not received", desc: "No transfer found in bank or wallet account" },
  { id: "Wrong amount", label: "Wrong amount", desc: "The transferred amount does not match the claim" },
  { id: "Wrong method", label: "Wrong method", desc: "Payment was sent through an unverified channel" },
  { id: "Other", label: "Other", desc: "Specify another reason in note below" },
] as const;

export function RejectClaimModal({
  isOpen,
  onClose,
  settlementId,
  payerName,
  amount,
  currency,
  onSuccess,
}: RejectClaimModalProps) {
  const [selectedReason, setSelectedReason] = useState<
    "Not received" | "Wrong amount" | "Wrong method" | "Other"
  >("Not received");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const res = await rejectSettlementAction({
        settlementId,
        reason: selectedReason,
        note: note.trim() || undefined,
      });

      if (res.success) {
        toast.info(res.message || "Payment claim was rejected");
        onSuccess?.();
        onClose();
      } else {
        toast.error(res.error || "Failed to reject claim");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>Reject Payment Claim</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-red-50/70 border border-red-100 rounded-xl p-3 text-xs text-red-900 leading-relaxed">
            Rejecting this claim will keep <span className="font-bold">{currency} {amount.toFixed(2)}</span> active as an outstanding debt on <span className="font-bold">{payerName}</span>&apos;s ledger.
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Reason for rejection <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {REJECTION_REASONS.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <label
                    key={r.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "border-red-400 bg-red-50/40 text-slate-900 ring-1 ring-red-400 font-medium"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={r.id}
                      checked={isSelected}
                      onChange={() => setSelectedReason(r.id)}
                      className="mt-0.5 text-red-600 focus:ring-red-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-semibold text-slate-800">{r.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{r.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Optional Note for {payerName}
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Please send the IBAN transfer receipt screenshot..."
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Rejecting...</span>
                </>
              ) : (
                <span>Confirm Reject</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
