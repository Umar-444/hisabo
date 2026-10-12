import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { getUserGroupsQuery } from "@/features/groups";
import { db } from "@/app/(backend)/_lib/db";
import { expenses, users, groups } from "@/app/(backend)/_lib/db/schema";
import { desc, inArray, eq } from "drizzle-orm";
import { ui } from "@/lib/ui";
import { fromMinorUnits } from "@/lib/money";
import Link from "next/link";
import { PlusCircle, ArrowLeft, Filter, Sparkles } from "lucide-react";

export const instant = false;

const CATEGORY_EMOJIS: Record<string, string> = {
  food: "🍽️",
  groceries: "🛒",
  rent: "🏠",
  utilities: "⚡",
  transport: "🚗",
  entertainment: "🍿",
  general: "🧾",
};

export default async function ExpensesPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const userGroups = await getUserGroupsQuery(session.id);
  const groupIds = userGroups.map((g) => g.id);

  let allExpenses: any[] = [];
  if (groupIds.length > 0) {
    allExpenses = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        amountMinor: expenses.amountMinor,
        currency: expenses.currency,
        category: expenses.category,
        status: expenses.status,
        createdAt: expenses.createdAt,
        paidBy: expenses.paidBy,
        payerName: users.name,
        groupName: groups.name,
      })
      .from(expenses)
      .innerJoin(users, eq(expenses.paidBy, users.id))
      .innerJoin(groups, eq(expenses.groupId, groups.id))
      .where(inArray(expenses.groupId, groupIds))
      .orderBy(desc(expenses.createdAt));
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Expenses Feed</h1>
            <p className="text-xs text-slate-500 font-medium">All group shared expenses</p>
          </div>
        </div>

        <Link
          href="/expenses/new"
          className={ui.btn({ variant: "primary", size: "sm" })}
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Expense</span>
        </Link>
      </div>

      {/* Main Expense Feed Container */}
      <div className="rounded-[20px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        {allExpenses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="h-12 w-12 rounded-[14px] bg-blue-50 text-[#185CFF] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">No expenses recorded yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Add your first shared expense to start keeping fair balance records.
            </p>
            <Link
              href="/expenses/new"
              className={ui.btn({ variant: "primary", size: "sm" })}
            >
              Add First Expense
            </Link>
          </div>
        ) : (
          <div className="space-y-0.5">
            {allExpenses.map((exp) => {
              const isPayer = exp.paidBy === session.id;
              const emoji = CATEGORY_EMOJIS[exp.category] || "🧾";
              const majorAmount = fromMinorUnits(exp.amountMinor);

              return (
                <Link
                  key={exp.id}
                  href={`/expenses/${exp.id}`}
                  className={ui.transactionRow}
                >
                  {/* Category Tile */}
                  <div className={ui.categoryTile}>
                    <span>{emoji}</span>
                  </div>

                  {/* Description & Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-[#0F172A] truncate leading-tight">
                      {exp.description}
                    </div>
                    <div className="text-[13px] text-slate-500 font-normal leading-normal mt-0.5">
                      {exp.groupName} · Paid by {isPayer ? "you" : exp.payerName}
                    </div>
                  </div>

                  {/* Financial Amount */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-[15px] font-bold tabular-nums tracking-tight ${
                        isPayer ? "text-[#10B981]" : "text-[#0F172A]"
                      }`}
                    >
                      {exp.currency} {majorAmount.toFixed(2)}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 capitalize">
                      {exp.status}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
