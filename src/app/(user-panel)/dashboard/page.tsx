import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/app/(backend)/_lib/db";
import { groups, groupMembers, expenses } from "@/app/(backend)/_lib/db/schema";
import { eq, desc, inArray, and } from "drizzle-orm";
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
import { getPendingActionsQuery, getActivePaymentRequestsMapQuery, DashboardPeerDebtsWidget } from "@/features/settlements";
import { PendingActionsCard } from "@/features/settlements/components/pending-actions-card";
import { CategoryTile } from "@/lib/categories";

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
  let userGroups: { id: string; name: string; defaultCurrency: string; role: string; joinedAt: Date | null }[] = [];
  try {
    if (isUuid(session.id)) {
      userGroups = await db
        .select({
          id: groups.id,
          name: groups.name,
          defaultCurrency: groups.defaultCurrency,
          role: groupMembers.role,
          joinedAt: groupMembers.joinedAt,
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
    const userGroupIds = userGroups.map((g) => g.id);
    if (userGroupIds.length > 0) {
      const rawRecent = await db
        .select({
          id: expenses.id,
          groupId: expenses.groupId,
          description: expenses.description,
          amountMinor: expenses.amountMinor,
          currency: expenses.currency,
          createdAt: expenses.createdAt,
          paidBy: expenses.paidBy,
          category: expenses.category,
        })
        .from(expenses)
        .where(
          and(
            inArray(expenses.groupId, userGroupIds),
            eq(expenses.status, "active")
          )
        )
        .orderBy(desc(expenses.createdAt))
        .limit(10);
      recentExpenses = rawRecent
        .filter((e) => {
          const userGrp = userGroups.find((g) => g.id === e.groupId);
          if (!userGrp) return false;
          const isPrivileged = userGrp.role === "owner" || userGrp.role === "admin";
          if (isPrivileged || e.paidBy === session.id) return true;
          if (userGrp.joinedAt && new Date(e.createdAt).getTime() >= new Date(userGrp.joinedAt).getTime()) return true;
          return false;
        })
        .slice(0, 6);
    }
  } catch (e) {
    console.error("Error loading expenses:", e);
  }

  const toIso = (val: unknown): string => {
    if (val instanceof Date) return val.toISOString();
    if (typeof val === "string") {
      const d = new Date(val);
      return isNaN(d.getTime()) ? val : d.toISOString();
    }
    return new Date().toISOString();
  };

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
    createdAt: toIso(st.createdAt),
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
    createdAt: toIso(st.createdAt),
  }));

  const activeRequests = await getActivePaymentRequestsMapQuery(session.id);
  const serializedRequestsMap: Record<string, string> = {};
  for (const [k, v] of Object.entries(activeRequests)) {
    serializedRequestsMap[k] = toIso(v);
  }

  const adminGroupIds = new Set(
    userGroups.filter((g) => g.role === "owner" || g.role === "admin").map((g) => g.id)
  );

  const dashboardPeers = aggregatedBalances.peerBalances.map((peer) => ({
    peerId: peer.peerId,
    peerName: peer.peerName,
    peerUsername: peer.peerUsername,
    groupId: peer.groupId,
    groupName: peer.groupName,
    currency: peer.currency,
    amountMajor: Math.abs(fromMinorUnits(peer.netMinor)),
    isOwedToUser: peer.netMinor > BigInt(0),
    isAdminOfGroup: adminGroupIds.has(peer.groupId),
  }));

  return (
    <div className="w-full space-y-5">
      {/* 1. Friendly Greeting */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0a1530]">
            Welcome back, {session.name.split(" ")[0]}
          </h1>
          <p className="text-xs md:text-sm text-[#787671] font-normal mt-0.5">
            {pendingActions.totalCount > 0
              ? `You have ${pendingActions.totalCount} pending action${pendingActions.totalCount > 1 ? "s" : ""} to review`
              : "Live ledger overview and balance status"}
          </p>
        </div>

        <Link
          href={userGroups.length > 0 ? `/groups/${userGroups[0].id}` : "/groups"}
          prefetch={false}
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
        <div className="space-y-3 lg:col-span-7">
          {/* 2. Signature Sharp Balance Hero Card (Multi-Currency Partitioned) */}
          <DashboardBalanceHero
            currencies={aggregatedBalances.currencies}
            byCurrency={serializedByCurrency}
            initialCurrency={aggregatedBalances.currency}
          />

          {/* Quick Pay & Payment Requests for Debts / Receivables */}
          <DashboardPeerDebtsWidget
            peers={dashboardPeers}
            activeRequestsMap={serializedRequestsMap}
          />

          {/* 3. SettleSmart Ledger Integrity Strip (Quiet Trust Banner) */}
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-slate-200/90 bg-white/70 shadow-2xs backdrop-blur-xs">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="h-4 w-4 text-[#185CFF] shrink-0" />
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-xs font-semibold text-[#0F172A]">SettleSmart Ledger Protection</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] shrink-0" />
                <span className="text-[11px] text-slate-500 font-normal hidden sm:inline truncate">
                  · Zero-loss integer math
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-right shrink-0 pl-2">
              <span className="text-[11px] font-bold text-emerald-600">● Balanced</span>
              <span className="text-[10px] font-medium text-slate-400">0 Disputes</span>
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

                  return (
                    <Link
                      key={exp.id}
                      href={`/expenses/${exp.id}`}
                      prefetch={false}
                      className={`${ui.transactionRow} hover:bg-slate-50/80 transition-colors cursor-pointer block`}
                    >
                      {/* Category Tile */}
                      <CategoryTile category={exp.category} size="md" />

                      {/* Title and Meta */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-[#1a1a1a] truncate leading-tight">
                          {exp.description}
                        </div>
                        <div className="text-[11px] text-[#787671] font-normal leading-normal mt-0.5">
                          {isPayer ? "Paid by you" : "Paid by roommate"}
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
                    </Link>
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
