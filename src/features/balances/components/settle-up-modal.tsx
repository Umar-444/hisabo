"use client";

import { useState, useTransition } from "react";
import { recordSettlementAction } from "@/features/settlements/actions";
import { HandCoins, X, AlertCircle, Copy, Check, ExternalLink, QrCode, Smartphone, CreditCard } from "lucide-react";
import { ui } from "@/lib/ui";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  peerId: string;
  peerName: string;
  peerPaymentHandle?: string | null;
  groupId: string;
  suggestedAmount: number;
  currency: string;
}

export function SettleUpModalClient({
  peerId,
  peerName,
  peerPaymentHandle,
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
  const [copied, setCopied] = useState(false);

  const handleCopyHandle = async () => {
    if (!peerPaymentHandle) return;
    try {
      await navigator.clipboard.writeText(peerPaymentHandle);
      setCopied(true);
      toast.success(`Copied "${peerPaymentHandle}" to clipboard!`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy payment handle.");
    }
  };

  const isStcPay = peerPaymentHandle && (
    peerPaymentHandle.toLowerCase().includes("stc") ||
    peerPaymentHandle.startsWith("05") ||
    peerPaymentHandle.startsWith("+9665") ||
    peerPaymentHandle.startsWith("9665")
  );

  const isIban = peerPaymentHandle && (
    peerPaymentHandle.toUpperCase().startsWith("SA") ||
    peerPaymentHandle.length >= 15
  );

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

            {/* Peer Payment Details Card (TASK-28) */}
            <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  {isStcPay ? (
                    <Smartphone className="h-3.5 w-3.5 text-purple-600" />
                  ) : (
                    <CreditCard className="h-3.5 w-3.5 text-[#185CFF]" />
                  )}
                  <span>Payee Payment Info</span>
                </div>
                {peerPaymentHandle && (
                  <span className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {isStcPay ? "STC Pay / Mobile" : isIban ? "Bank IBAN" : "Payment Handle"}
                  </span>
                )}
              </div>

              {peerPaymentHandle ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl bg-white border border-slate-200/90 px-3 py-2 shadow-2xs">
                    <span className="font-mono text-xs font-bold text-[#0F172A] tracking-wider select-all break-all">
                      {peerPaymentHandle}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyHandle}
                      className="ml-2 inline-flex items-center gap-1 shrink-0 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 text-slate-500" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {isStcPay && (
                    <a
                      href={`tel:${peerPaymentHandle.replace(/[^0-9+]/g, "")}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#185CFF] hover:underline"
                    >
                      <Smartphone className="h-3 w-3" />
                      <span>Open in Phone / STC Pay</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}

                  <p className="text-[10px] text-slate-500 leading-tight">
                    Transfer the funds using your banking app, then record this settlement below so {peerName} can confirm receipt.
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  {peerName} hasn't added a payment handle yet. You can transfer via cash or ask them to add their IBAN in Settings.
                </p>
              )}
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
