"use client";

import { useState, useTransition } from "react";
import { recordSettlementAction } from "@/features/settlements/actions";
import { HandCoins, X, AlertCircle } from "lucide-react";
import { ui } from "@/lib/ui";
import { useRouter } from "next/navigation";

interface Props {
  peerId: string;
  peerName: string;
  groupId: string;
  suggestedAmount: number;
  currency: string;
}

export function SettleUpModalClient({
  peerId,
  peerName,
  groupId,
  suggestedAmount,
  currency,
}: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState(suggestedAmount.toFixed(2));
  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "cash" | "other">("bank_transfer");
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = parseFloat(amount);
    if (!parsed || parsed <= 0) {
      setErrorMsg("Please enter a settlement amount greater than 0");
      return;
    }

    startTransition(async () => {
      const res = await recordSettlementAction({
        groupId,
        payeeId: peerId,
        amount: parsed,
        currency,
        paymentMethod,
        note: note.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to record settlement");
      } else {
        setIsOpen(false);
        router.push("/settlements");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="h-8 px-3 rounded-xl bg-[#185CFF] text-white font-bold text-xs hover:bg-[#1249D6] transition-all shadow-xs active:scale-[0.98] cursor-pointer"
      >
        Settle Up
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => {
                setIsOpen(false);
                setErrorMsg(null);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#185CFF] flex items-center justify-center">
                <HandCoins className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Settle with {peerName}</h3>
                <p className="text-xs text-slate-500">Record an off-platform payment</p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={ui.label}>Settlement Amount</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-400">
                    {currency}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-[14px] border border-slate-200 bg-white pl-14 pr-4 py-2.5 text-base font-mono font-bold text-[#0F172A] focus:border-[#185CFF] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className={ui.label}>Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className={ui.select}
                >
                  <option value="bank_transfer">Bank Transfer (STC Pay / Wire)</option>
                  <option value="cash">Cash in Person</option>
                  <option value="other">Other Payment</option>
                </select>
              </div>

              <div>
                <label className={ui.label}>Note / Reference (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Transfer ref #8372"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className={ui.input}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 rounded-xl bg-[#185CFF] text-white font-bold text-sm hover:bg-[#1249D6] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? "Recording Payment..." : "Record Payment & Send Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
