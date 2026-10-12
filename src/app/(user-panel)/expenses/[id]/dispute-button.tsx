"use client";

import { useState, useTransition } from "react";
import { disputeExpenseAction } from "@/features/expenses/actions";
import { AlertTriangle, X } from "lucide-react";
import { ui } from "@/lib/ui";

export function DisputeButtonClient({ expenseId }: { expenseId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDispute = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (reason.trim().length < 3) {
      setErrorMsg("Please enter a valid explanation for disputing this expense.");
      return;
    }

    startTransition(async () => {
      const res = await disputeExpenseAction(expenseId, reason.trim());
      if (!res.success) {
        setErrorMsg(res.error || "Failed to submit dispute");
      } else {
        setIsOpen(false);
      }
    });
  };

  return (
    <div>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>Dispute this expense</span>
        </button>
      ) : (
        <form onSubmit={handleDispute} className="rounded-xl bg-red-50/60 p-4 border border-red-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-red-800 flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Dispute Expense
            </h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[11px] text-red-700">
            Let the group know why this amount or split is incorrect.
          </p>

          {errorMsg && <p className="text-[11px] font-bold text-red-600">{errorMsg}</p>}

          <textarea
            required
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., I did not participate in this dinner, or my share was SAR 20..."
            className="w-full rounded-xl border border-red-200 bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-red-400"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? "Submitting..." : "Confirm Dispute"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
