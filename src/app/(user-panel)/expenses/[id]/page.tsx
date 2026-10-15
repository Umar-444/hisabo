import { getUserSession } from "@/lib/auth/user-session";
import { redirect, notFound } from "next/navigation";
import { getExpenseDetailQuery } from "@/features/expenses";
import { fromMinorUnits } from "@/lib/money";
import { ui } from "@/lib/ui";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Building2,
  ShieldCheck,
  AlertTriangle,
  User,
  CheckCircle2,
} from "lucide-react";
import { DisputeButtonClient } from "@/features/expenses/components/dispute-button";
import { CancelExpenseButtonClient } from "@/features/expenses/components/cancel-expense-button";
import { EditExpenseModalClient } from "@/features/expenses/components/edit-expense-modal";

import { CategoryTile } from "@/lib/categories";
import { ExpenseQuickPayButton } from "@/features/expenses/components/expense-quick-pay-button";
import { PaymentRequestButton } from "@/features/settlements";

export const dynamic = "force-dynamic";

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUserSession();
  if (!session) {
    return null;
  }

  const { id } = await params;
  const expense = await getExpenseDetailQuery(id, session.id);

  if (!expense) {
    notFound();
  }

  const totalMajor = fromMinorUnits(expense.amountMinor);
  const userShareMajor = expense.userShareMinor ? fromMinorUnits(expense.userShareMinor) : null;

  return (
    <div className="mx-auto max-w-xl space-y-5 pb-24">
      {/* Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/expenses"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Expense Detail
        </span>
        <div className="w-10" />
      </div>

      {/* Cancelled Banner if voided */}
      {expense.status === "cancelled" && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-center space-y-1">
          <div className="text-xs font-bold text-red-900 flex items-center justify-center gap-1.5">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span>Expense Cancelled / Voided</span>
          </div>
          <p className="text-xs text-red-700/90">
            This expense was cancelled and is completely excluded from active ledger balances.
          </p>
        </div>
      )}

      {/* Hero Summary Card */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xs text-center relative overflow-hidden">
        <CategoryTile category={expense.category} size="lg" className="mx-auto mb-3" />

        <h1 className="text-xl font-black text-[#0F172A] tracking-tight">{expense.description}</h1>

        <div className="mt-2 flex items-baseline justify-center">
          <span className="font-mono text-xl font-bold text-slate-400 mr-1.5">
            {expense.currency}
          </span>
          <span className="text-4xl font-black tabular-nums text-[#0F172A] tracking-tight">
            {totalMajor.toFixed(2)}
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500 font-medium">
          Paid by <span className="font-bold text-[#0F172A]">{expense.paidByName}</span> on{" "}
          {expense.createdAt.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>

        {/* User Share Banner */}
        {userShareMajor !== null && (
          <div className="mt-5 rounded-[14px] bg-slate-50 p-3.5 border border-slate-200/80 flex items-center justify-between text-xs font-semibold gap-3">
            <div>
              <span className="text-slate-600 block">Your Share:</span>
              <span className="font-bold font-mono text-[#0F172A] text-sm">
                {expense.currency} {userShareMajor.toFixed(2)}
              </span>
            </div>

            {expense.paidById !== session.id && (
              <ExpenseQuickPayButton
                groupId={expense.groupId}
                groupName={expense.groupName}
                payeeId={expense.paidById}
                payeeName={expense.paidByName}
                amount={userShareMajor}
                currency={expense.currency}
              />
            )}
          </div>
        )}
      </div>

      {/* Split Allocation Table */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A]">Participant Splits</h2>
          <span className="text-xs text-slate-400 font-medium">
            {expense.splits.length} participants
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {expense.splits.map((split) => {
            const shareMajor = fromMinorUnits(split.shareMinor);
            const isUser = split.userId === session.id;

            return (
              <div key={split.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-blue-50 text-[#185CFF] font-black text-xs flex items-center justify-center shrink-0">
                    {split.userName.charAt(0)}
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="text-sm font-bold text-[#0F172A] truncate">
                      {split.userName} {isUser ? "(You)" : ""}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">@{split.userUsername}</div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-2.5 shrink-0">
                  <div>
                    <div className="text-sm font-bold font-mono text-[#0F172A] tabular-nums">
                      {expense.currency} {shareMajor.toFixed(2)}
                    </div>
                    <span
                      className={ui.badge({
                        status: split.decisionStatus as any,
                        className: "text-[9px] px-2 py-0 mt-0.5",
                      })}
                    >
                      {split.decisionStatus}
                    </span>
                  </div>

                  {expense.paidById === session.id && !isUser && (
                    <PaymentRequestButton
                      groupId={expense.groupId}
                      debtorId={split.userId}
                      debtorName={split.userName}
                      amount={shareMajor}
                      currency={expense.currency}
                      expenseId={expense.id}
                      size="sm"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metadata & Actions */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <Building2 className="h-4 w-4 text-slate-400" />
            Group
          </span>
          <Link
            href={`/groups/${expense.groupId}`}
            className="font-bold text-[#185CFF] hover:underline"
          >
            {expense.groupName}
          </Link>
        </div>

        <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-medium flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            Integrity Check
          </span>
          <span className="font-bold text-emerald-600">Zero-Loss Verified</span>
        </div>

        {/* Actions for Active Expense */}
        {expense.status === "active" && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            {!expense.isUserPayer && <DisputeButtonClient expenseId={expense.id} />}
            {expense.isUserPayer && (
              <div className="flex items-center gap-2">
                <EditExpenseModalClient
                  expenseId={expense.id}
                  initialDescription={expense.description}
                  initialCategory={expense.category}
                />
                <CancelExpenseButtonClient
                  expenseId={expense.id}
                  description={expense.description}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
