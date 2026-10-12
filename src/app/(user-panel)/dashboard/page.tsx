import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/app/(backend)/_lib/db";
import { groups, groupMembers, expenses } from "@/app/(backend)/_lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ui } from "@/lib/ui";
import {
  CreditCard,
  PlusCircle,
  HandCoins,
  ShieldCheck,
  ChevronRight,
  Building2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

import { getAggregatedBalancesQuery } from "@/features/balances";
import { fromMinorUnits } from "@/lib/money";
import {
  DashboardBalanceHero,
  SerializedCurrencySummary,
} from "@/features/balances/components/dashboard-balance-hero";
import { getPendingActionsQuery } from "@/features/settlements";
import { PendingActionsCard } from "@/features/settlements/components/pending-actions-card";

export const instant = false;

export default async function DashboardPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch live aggregated balance with multi-currency segregation
  const aggregatedBalances = await getAggregatedBalancesQuery(session.id);

  // Safely serialize byCurrency for Client Component
  const serializedByCurrency: Record<string, SerializedCurrencySummary> = {};
  for (const cur of aggregatedBalances.currencies) {
    const s = aggregatedBalances.byCurrency[cur] || {
      currency: cur,
      totalCreditMinor: BigInt(0),
      totalDebitMinor: BigInt(0),
      netTotalMinor: BigInt(0),
    };

    const netMajor = fromMinorUnits(s.netTotalMinor);
    const absNet = Math.abs(netMajor);
    const integerStr = Math.floor(absNet).toString();
    const centsStr = Math.round((absNet - Math.floor(absNet)) * 100)
      .toString()
      .padStart(2, "0");

    serializedByCurrency[cur] = {
      currency: cur,
      totalCreditMajor: fromMinorUnits(s.totalCreditMinor),
      totalDebitMajor: fromMinorUnits(s.totalDebitMinor),
      netTotalMajor: netMajor,
      isPositive: s.netTotalMinor > BigInt(0),
      isNegative: s.netTotalMinor < BigInt(0),
      isZero: s.netTotalMinor === BigInt(0),
      integerStr,
      centsStr,
    };
  }

  // Fetch groups
  let userGroups: { id: string; name: string; defaultCurrency: string; role: string }[] = [];
  try {
    userGroups = await db
      .select({
        id: groups.id,
        name: groups.name,
        defaultCurrency: groups.defaultCurrency,
        role: groupMembers.role,
      })
      .from(groupMembers)
      .innerJoin(groups, eq(groupMembers.groupId, groups.id))
      .where(eq(groupMembers.userId, session.id));
  } catch (e) {
    console.error("Error loading groups:", e);
  }

  // Fetch recent expenses
  let recentExpenses: {
    id: string;
    description: string;
    amountMinor: bigint;
    currency: string;
    createdAt: Date;
    paidBy: string;
    category: string;
  }[] = [];

  try {
    recentExpenses = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        amountMinor: expenses.amountMinor,
        currency: expenses.currency,
        createdAt: expenses.createdAt,
        paidBy: expenses.paidBy,
        category: expenses.category,
      })
      .from(expenses)
      .orderBy(desc(expenses.createdAt))
      .limit(6);
  } catch (e) {
    console.error("Error loading expenses:", e);
  }

  // Fetch pending actions / settlements needing attention
  const pendingActions = await getPendingActionsQuery(session.id);
  const serializedPending = pendingActions.pendingToConfirm.map((st) => ({
    id: st.id,
    groupId: st.groupId,
    groupName: st.groupName,
    payerId: st.payerId,
    payerName: st.payerName,
    payerUsername: st.payerUsername,
    payeeId: st.payeeId,
    payeeName: st.payeeName,
    amountMajor: fromMinorUnits(st.amountMinor),
    currency: st.currency,
    status: st.status,
    paymentMethod: st.paymentMethod,
    note: st.note,
    createdAt: st.createdAt.toISOString(),
  }));

  const serializedDisputes = pendingActions.activeDisputes.map((st) => ({
    id: st.id,
    groupId: st.groupId,
    groupName: st.groupName,
    payerId: st.payerId,
    payerName: st.payerName,
    payerUsername: st.payerUsername,
    payeeId: st.payeeId,
    payeeName: st.payeeName,
    amountMajor: fromMinorUnits(st.amountMinor),
    currency: st.currency,
    status: st.status,
    paymentMethod: st.paymentMethod,
    note: st.note,
    createdAt: st.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-20">
      {/* 1. Friendly Greeting */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
            Hi, {session.name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {pendingActions.totalCount > 0
              ? `You have ${pendingActions.totalCount} pending action${pendingActions.totalCount > 1 ? "s" : ""} to review`
              : "Here is your live shared balance overview"}
          </p>
        </div>

        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <Building2 className="h-3.5 w-3.5 text-[#185CFF]" />
          <span>
            {userGroups.length > 0
              ? userGroups[0].name
              : "Join a Group"}
          </span>
        </Link>
      </div>

      {/* Pending Actions Center Alert (Visible when flatmates submit settlement claims) */}
      <PendingActionsCard
        pendingSettlements={serializedPending}
        disputes={serializedDisputes}
      />

      {/* 2. Signature Chime-Inspired Balance Hero Card (Multi-Currency Partitioned) */}
      <DashboardBalanceHero
        currencies={aggregatedBalances.currencies}
        byCurrency={serializedByCurrency}
        initialCurrency={aggregatedBalances.currency}
      />

      {/* 3. SettleSmart Banner (Chime SpotMe Equivalent) */}
      <div className={ui.settleSmartBanner}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-[#185CFF] border border-blue-100">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            SettleSmart is on
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          </div>
          <div className="text-xs text-slate-500 truncate">
            Zero-loss integer ledger · Fair remainder allocation
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-[#185CFF]">Balanced</div>
          <div className="text-[10px] text-slate-400 font-medium">0 Disputes</div>
        </div>
      </div>

      {/* 4. Recent Activity Section */}
      <div className="rounded-[20px] border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3.5 mb-1">
          <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
            Recent activity
          </h2>
          <Link
            href="/expenses"
            className="text-xs font-bold text-[#185CFF] hover:underline"
          >
            See all
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="py-10 text-center">
            <div className="h-12 w-12 rounded-[14px] bg-blue-50 text-[#185CFF] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">No expenses recorded yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Split groceries, dinner, rent, or utilities with zero confusion.
            </p>
            <Link
              href="/expenses/new"
              className={ui.btn({ variant: "primary", size: "sm" })}
            >
              Add first expense
            </Link>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recentExpenses.map((exp) => {
              const isPayer = exp.paidBy === session.id;
              // Format category emoji tile
              const categoryEmojis: Record<string, string> = {
                food: "🍽️",
                groceries: "🛒",
                rent: "🏠",
                utilities: "⚡",
                transport: "🚗",
                entertainment: "🍿",
                general: "🧾",
              };
              const emoji = categoryEmojis[exp.category] || "🧾";

              return (
                <div key={exp.id} className={ui.transactionRow}>
                  {/* Category Tile */}
                  <div className={ui.categoryTile}>
                    <span>{emoji}</span>
                  </div>

                  {/* Title and Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-[#0F172A] truncate leading-tight">
                      {exp.description}
                    </div>
                    <div className="text-[13px] text-slate-500 font-normal leading-normal mt-0.5">
                      Today · {isPayer ? "Paid by you" : "Paid by roommate"} · 4 participants
                    </div>
                  </div>

                  {/* Amount Column - Positive in Emerald, routine in neutral ink */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-[15px] font-bold tabular-nums tracking-tight ${
                        isPayer ? "text-[#10B981]" : "text-[#0F172A]"
                      }`}
                    >
                      {isPayer
                        ? `+${exp.currency} ${fromMinorUnits(exp.amountMinor).toFixed(2)}`
                        : `-${exp.currency} ${fromMinorUnits(exp.amountMinor).toFixed(2)}`}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 tabular-nums">
                      {isPayer ? "You paid total" : `Total: ${exp.currency} ${fromMinorUnits(exp.amountMinor).toFixed(2)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Group Snapshot Card */}
      {userGroups.length > 0 && (
        <div className="rounded-[20px] border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#0F172A] tracking-tight">
              Active Group Pool
            </h3>
            <span className="text-[11px] font-bold text-slate-500">
              {userGroups.length} {userGroups.length === 1 ? "Group" : "Groups"}
            </span>
          </div>

          {userGroups.map((group) => (
            <Link
              key={group.id}
              href={`/groups/${group.id}`}
              className="flex items-center justify-between rounded-[14px] bg-slate-50 p-3.5 hover:bg-slate-100/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-purple-100 text-purple-700 font-black text-sm">
                  🏢
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0F172A]">
                    {group.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    4 flatmates · Currency: {group.defaultCurrency}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#10B981] border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
