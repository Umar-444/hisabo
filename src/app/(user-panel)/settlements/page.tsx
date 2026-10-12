import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { getUserSettlementsQuery } from "@/features/settlements";
import { fromMinorUnits } from "@/lib/money";
import { ui } from "@/lib/ui";
import Link from "next/link";
import {
  ArrowLeft,
  HandCoins,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Sparkles,
} from "lucide-react";
import { SettlementActionButtonsClient } from "@/features/settlements/components/settlement-actions-client";

export const instant = false;

export default async function SettlementsPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const settlementsList = await getUserSettlementsQuery(session.id);

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link
            href="/balances"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Settlements Ledger</h1>
            <p className="text-xs text-slate-500 font-medium">
              Record of off-platform payments & debtor claims
            </p>
          </div>
        </div>
      </div>

      {/* Settlements Feed Container */}
      <div className="rounded-[20px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        {settlementsList.length === 0 ? (
          <div className="py-12 text-center">
            <div className="h-12 w-12 rounded-[14px] bg-blue-50 text-[#185CFF] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">No settlements recorded yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              When someone pays off their shared debt via STC Pay or cash, record it here to clear the balance.
            </p>
            <Link
              href="/balances"
              className={ui.btn({ variant: "primary", size: "sm" })}
            >
              View Outstanding Balances
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {settlementsList.map((st) => {
              const amountMajor = fromMinorUnits(st.amountMinor);
              const isPayer = st.payerId === session.id;
              const isPayee = st.payeeId === session.id;

              return (
                <div key={st.id} className="py-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-[14px] bg-emerald-50 text-[#10B981] flex items-center justify-center font-bold text-lg border border-emerald-100">
                        🤝
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0F172A]">
                          {isPayer
                            ? `You paid ${st.payeeName}`
                            : `${st.payerName} paid you`}
                        </div>
                        <div className="text-xs text-slate-500">
                          {st.groupName} · Method: <span className="capitalize">{st.paymentMethod.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-base font-black font-mono tabular-nums text-[#0F172A]">
                        {st.currency} {amountMajor.toFixed(2)}
                      </div>
                      <span
                        className={ui.badge({
                          status: st.status as any,
                          className: "text-[9px] px-2 py-0 mt-0.5",
                        })}
                      >
                        {st.status}
                      </span>
                    </div>
                  </div>

                  {st.note && (
                    <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 font-medium">
                      Note: &ldquo;{st.note}&rdquo;
                    </div>
                  )}

                  {/* Actions for Payee if Pending */}
                  {isPayee && st.status === "pending" && (
                    <div className="pt-1 flex items-center justify-between bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
                      <div className="text-xs text-amber-800 font-medium flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-amber-600" />
                        Did you receive this payment?
                      </div>

                      <SettlementActionButtonsClient settlementId={st.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
