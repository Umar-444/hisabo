"use client";

import { useState, useTransition } from "react";
import { cancelExpenseAction } from "@/features/expenses/actions";
import { Trash2, AlertCircle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function CancelExpenseButtonClient({
  expenseId,
  description,
}: {
  expenseId: string;
  description: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCancel = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    startTransition(async () => {
      const res = await cancelExpenseAction(expenseId, reason.trim() || undefined);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to cancel expense");
      } else {
        toast.success("Expense cancelled and excluded from active balances.");
        setIsOpen(false);
        router.refresh();
      }
    });
  };

  return (
    <div>
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>Cancel & Void Expense</span>
        </button>
      ) : (
        <form
          onSubmit={handleCancel}
          className="rounded-xl bg-red-50/70 p-4 border border-red-200 space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-600" />
              Void & Cancel &ldquo;{description}&rdquo;
            </h4>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-[11px] text-red-700 leading-relaxed">
            Cancelling this expense will void all participant shares and immediately recalculate net group balances. The transaction record is preserved in group audit logs for transparency.
          </p>

          {errorMsg && (
            <p className="text-[11px] font-bold text-red-600 bg-red-100/60 p-2 rounded-lg">
              {errorMsg}
            </p>
          )}

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Cancellation Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Duplicate bill, incorrect amount, or paid separately"
              className="w-full rounded-xl border border-red-200 bg-white p-2.5 text-xs text-[#0F172A] focus:outline-none focus:border-red-400"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{isPending ? "Cancelling..." : "Confirm Cancellation"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
