import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/app/(backend)/_lib/db";
import { groups, groupMembers, expenses } from "@/app/(backend)/_lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ui } from "@/lib/ui";
import { isUuid } from "@/lib/utils";
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

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getUserSession();
  if (!session) {
    return null;
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
    if (isUuid(session.id)) {
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
    }
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
    <div className="w-full space-y-5">
      {/* 1. Friendly Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0a1530]">
            Hi, {session.name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs md:text-sm text-[#787671] font-normal mt-0.5">
            {pendingActions.totalCount > 0
              ? `You have ${pendingActions.totalCount} pending action${pendingActions.totalCount > 1 ? "s" : ""} to review`
              : "Live ledger overview and balance status"}
          </p>
        </div>

        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 rounded-md border border-[#c8c4be] bg-white px-2.5 py-1 text-xs font-semibold text-[#1a1a1a] shadow-2xs hover:bg-[#f6f5f4] transition-colors"
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

      {/* Main Content Sections: Full-width responsive 2-column grid on desktop (lg:), stacked on mobile/tablet */}
      <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 items-start">
        {/* Left Column (Desktop 7 cols): Balance Hero Card & SettleSmart Protection */}
        <div className="space-y-5 lg:col-span-7">
          {/* 2. Signature Sharp Balance Hero Card (Multi-Currency Partitioned) */}
          <DashboardBalanceHero
            currencies={aggregatedBalances.currencies}
            byCurrency={serializedByCurrency}
            initialCurrency={aggregatedBalances.currency}
          />

          {/* 3. SettleSmart Budget & Ledger Health Banner (Notion Sky Tint) */}
          <div className="flex items-center gap-3 rounded-xl border border-[#c0dcf7] bg-[#dcecfa]/80 p-3.5 shadow-2xs">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#0075de] text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#0a3663] flex items-center gap-1.5">
                SettleSmart Ledger Protection
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
              </div>
              <div className="text-[11px] text-[#0a3663]/80 truncate">
                Zero-loss integer math · Deterministic halala remainder allocation
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-bold text-[#0075de]">Balanced</div>
              <div className="text-[10px] text-[#0a3663]/70 font-semibold">0 Disputes</div>
            </div>
          </div>
        </div>

        {/* Right Column (Desktop 5 cols): Recent Activity & Active Group Pool */}
        <div className="space-y-5 lg:col-span-5">
          {/* 4. Recent Activity Section (Notion Sharp Canvas Card) */}
          <div className="rounded-xl border border-[#e5e3df] bg-white p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#ede9e4] mb-1">
              <h2 className="text-sm font-bold text-[#0a1530] tracking-tight">
                Recent Activity
              </h2>
              <Link
                href="/expenses"
                className="text-xs font-semibold text-[#185CFF] hover:underline"
              >
                View all
              </Link>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="py-8 text-center">
                <div className="h-10 w-10 rounded-md bg-[#e6e0f5] text-[#7b3ff2] flex items-center justify-center mx-auto mb-2.5">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-xs font-bold text-[#0a1530]">No expenses recorded yet</p>
                <p className="text-[11px] text-[#787671] mt-0.5 mb-3">
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
                        <div className="text-xs font-semibold text-[#1a1a1a] truncate leading-tight">
                          {exp.description}
                        </div>
                        <div className="text-[11px] text-[#787671] font-normal leading-normal mt-0.5">
                          {isPayer ? "Paid by you" : "Paid by roommate"} · 4 participants
                        </div>
                      </div>

                      {/* Amount Column - Positive in Emerald, routine in neutral ink */}
                      <div className="text-right shrink-0">
                        <div
                          className={`text-xs font-bold tabular-nums tracking-tight font-mono ${
                            isPayer ? "text-[#10B981]" : "text-[#1a1a1a]"
                          }`}
                        >
                          {isPayer
                            ? `+${exp.currency} ${fromMinorUnits(exp.amountMinor).toFixed(2)}`
                            : `-${exp.currency} ${fromMinorUnits(exp.amountMinor).toFixed(2)}`}
                        </div>
                        <div className="text-[10px] font-medium text-[#787671] tabular-nums">
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
            <div className="rounded-xl border border-[#e5e3df] bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#ede9e4]">
                <h3 className="text-sm font-bold text-[#0a1530] tracking-tight">
                  Active Group Pool
                </h3>
                <span className="text-[11px] font-semibold text-[#787671]">
                  {userGroups.length} {userGroups.length === 1 ? "Group" : "Groups"}
                </span>
              </div>

              <div className="space-y-2">
                {userGroups.map((group) => (
                  <Link
                    key={group.id}
                    href={`/groups/${group.id}`}
                    className="flex items-center justify-between rounded-lg border border-[#e5e3df] bg-[#f6f5f4] p-3 hover:bg-[#ede9e4] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e6e0f5] text-[#7b3ff2] font-black text-sm border border-[#d1c7ec]">
                        🏢
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0a1530]">
                          {group.name}
                        </div>
                        <div className="text-[11px] text-[#787671]">
                          Currency: {group.defaultCurrency} · Role: {group.role}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#d9f3e1] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0f5132] border border-[#b8e8c6]">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                      <ChevronRight className="h-4 w-4 text-[#787671]" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
