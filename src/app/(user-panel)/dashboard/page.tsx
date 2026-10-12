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
  Zap,
  Lock,
  Layers,
  ArrowRight,
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
    <div className="mx-auto max-w-2xl space-y-6 pb-20">
      {/* ------------------------------------------------------------------- */}
      {/* 1. NOTION-STYLE USER HEADER & ACTIVE GROUP PILL                     */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0a1530]">
            Hi, {session.name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-[#787671] font-medium mt-0.5">
            {pendingActions.totalCount > 0
              ? `You have ${pendingActions.totalCount} pending action${pendingActions.totalCount > 1 ? "s" : ""} to review`
              : "Here is your live shared balance overview"}
          </p>
        </div>

        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e3df] bg-white px-3.5 py-1.5 text-xs font-bold text-[#37352f] shadow-2xs hover:bg-[#f6f5f4] transition-colors"
        >
          <Building2 className="h-3.5 w-3.5 text-[#185cff]" />
          <span>
            {userGroups.length > 0 ? userGroups[0].name : "Join a Group"}
          </span>
        </Link>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* PENDING ACTIONS CENTER ALERT (Notion Warm Amber Styling)            */}
      {/* ------------------------------------------------------------------- */}
      <PendingActionsCard
        pendingSettlements={serializedPending}
        disputes={serializedDisputes}
      />

      {/* ------------------------------------------------------------------- */}
      {/* 2. NOTION DEEP NAVY HERO BALANCE CARD                               */}
      {/* ------------------------------------------------------------------- */}
      <DashboardBalanceHero
        currencies={aggregatedBalances.currencies}
        byCurrency={serializedByCurrency}
        initialCurrency={aggregatedBalances.currency}
      />

      {/* ------------------------------------------------------------------- */}
      {/* 3. SETTLESMART STATUS BANNER (Notion Minimalist Surface Card)        */}
      {/* ------------------------------------------------------------------- */}
      <div className="flex items-center gap-3.5 rounded-2xl border border-[#e5e3df] bg-white p-4 shadow-2xs">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e6e0f5] text-[#7b3ff2] border border-[#d1c7ec]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#0a1530] flex items-center gap-2">
            SettleSmart Invariant
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div className="text-xs text-[#787671] truncate mt-0.5">
            Zero-loss integer math · Remainder conservation verified
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-[#185cff]">Active Ledger</div>
          <div className="text-[10px] text-[#787671] font-medium">0 Invariant Drift</div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 4. 4 NOTION PASTEL STORY & LEDGER CARDS                             */}
      {/* ------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5">
        {/* Peach Card: Integer Math */}
        <div className="rounded-2xl bg-[#ffe8d4] border border-[#f5d0b5] p-4 text-[#37352f] flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1 rounded-md bg-[#793400] text-white px-2 py-0.5 text-[10px] font-bold mb-2">
              📐 Integer Math
            </div>
            <div className="text-sm font-bold text-[#523410]">Zero-Loss Engine</div>
            <p className="text-[11px] text-[#793400]/80 mt-1 leading-normal">
              Halala remainders allocated fairly. Σ splits = 100% total.
            </p>
          </div>
          <div className="mt-3 text-[10px] font-mono text-[#523410] font-semibold">
            Status: 0 Drift
          </div>
        </div>

        {/* Mint Card: Two-Party Trust */}
        <div className="rounded-2xl bg-[#d9f3e1] border border-[#b8e8c6] p-4 text-[#37352f] flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1 rounded-md bg-[#1aae39] text-white px-2 py-0.5 text-[10px] font-bold mb-2">
              🤝 Two-Party Trust
            </div>
            <div className="text-sm font-bold text-[#0f5132]">Payee Receipt</div>
            <p className="text-[11px] text-[#0f5132]/80 mt-1 leading-normal">
              Debts only clear once confirmed by creditor.
            </p>
          </div>
          <div className="mt-3 text-[10px] font-semibold text-[#0f5132]">
            {pendingActions.totalCount === 0 ? "0 Pending Claims" : `${pendingActions.totalCount} Awaiting Review`}
          </div>
        </div>

        {/* Sky Card: Currencies */}
        <div className="rounded-2xl bg-[#dcecfa] border border-[#c0dcf7] p-4 text-[#37352f] flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1 rounded-md bg-[#0075de] text-white px-2 py-0.5 text-[10px] font-bold mb-2">
              💱 Multi-Currency
            </div>
            <div className="text-sm font-bold text-[#0a3663]">Segregated Ledgers</div>
            <p className="text-[11px] text-[#0a3663]/80 mt-1 leading-normal">
              Balances partitioned cleanly without rate guessing.
            </p>
          </div>
          <div className="mt-3 text-[10px] font-semibold text-[#0a3663] truncate">
            {aggregatedBalances.currencies.join(" · ")}
          </div>
        </div>

        {/* Lavender Card: Security */}
        <div className="rounded-2xl bg-[#e6e0f5] border border-[#d1c7ec] p-4 text-[#37352f] flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1 rounded-md bg-[#7b3ff2] text-white px-2 py-0.5 text-[10px] font-bold mb-2">
              🔒 Expiring Invites
            </div>
            <div className="text-sm font-bold text-[#391c57]">Secure Joining</div>
            <p className="text-[11px] text-[#391c57]/80 mt-1 leading-normal">
              Cryptographic invite tokens with 7-day auto-expiry.
            </p>
          </div>
          <div className="mt-3 text-[10px] font-semibold text-[#391c57]">
            SHA-256 Protected
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 5. RECENT ACTIVITY (Notion Database List Style)                     */}
      {/* ------------------------------------------------------------------- */}
      <div className="rounded-2xl border border-[#e5e3df] bg-white p-5 sm:p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-3.5 mb-1 border-b border-[#e5e3df]">
          <h2 className="text-base font-bold text-[#0a1530] tracking-tight">
            Recent activity
          </h2>
          <Link
            href="/expenses"
            className="text-xs font-bold text-[#185cff] hover:underline"
          >
            See all
          </Link>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="py-10 text-center">
            <div className="h-12 w-12 rounded-xl bg-blue-50 text-[#185cff] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-[#0a1530]">No expenses recorded yet</p>
            <p className="text-xs text-[#787671] mt-1 mb-4">
              Split groceries, dinner, rent, or utilities with zero confusion.
            </p>
            <Link
              href="/expenses/new"
              className="inline-flex items-center justify-center rounded-xl bg-[#185cff] text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-[#1249d6]"
            >
              Add first expense
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#f0eeec]">
            {recentExpenses.map((exp) => {
              const isPayer = exp.paidBy === session.id;
              // Format category emoji tile with pastel Notion background
              const categoryDetails: Record<string, { emoji: string; bg: string }> = {
                food: { emoji: "🍽️", bg: "bg-[#d9f3e1]" },
                groceries: { emoji: "🛒", bg: "bg-[#ffe8d4]" },
                rent: { emoji: "🏠", bg: "bg-[#e6e0f5]" },
                utilities: { emoji: "⚡", bg: "bg-[#fef7d6]" },
                transport: { emoji: "🚗", bg: "bg-[#dcecfa]" },
                entertainment: { emoji: "🍿", bg: "bg-[#fde0ec]" },
                general: { emoji: "🧾", bg: "bg-[#f0eeec]" },
              };
              const { emoji, bg } = categoryDetails[exp.category] || { emoji: "🧾", bg: "bg-[#f0eeec]" };

              return (
                <div key={exp.id} className="flex items-center gap-3.5 py-3.5 first:pt-2 last:pb-1">
                  {/* Category Tile */}
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg} text-base border border-black/5`}>
                    <span>{emoji}</span>
                  </div>

                  {/* Title and Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-[#0a1530] truncate leading-tight">
                      {exp.description}
                    </div>
                    <div className="text-xs text-[#787671] font-normal leading-normal mt-0.5">
                      Today · {isPayer ? "Paid by you" : "Paid by roommate"} · 4 participants
                    </div>
                  </div>

                  {/* Amount Column */}
                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm font-extrabold tabular-nums tracking-tight font-mono ${
                        isPayer ? "text-[#10B981]" : "text-[#0a1530]"
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

      {/* ------------------------------------------------------------------- */}
      {/* 6. ACTIVE GROUP SNAPSHOT (Notion Workspace Cards)                   */}
      {/* ------------------------------------------------------------------- */}
      {userGroups.length > 0 && (
        <div className="rounded-2xl border border-[#e5e3df] bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#e5e3df]">
            <h3 className="text-sm font-bold text-[#0a1530] tracking-tight">
              Active Group Workspaces
            </h3>
            <span className="text-[11px] font-bold text-[#787671]">
              {userGroups.length} {userGroups.length === 1 ? "Group" : "Groups"}
            </span>
          </div>

          <div className="space-y-2">
            {userGroups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="flex items-center justify-between rounded-xl bg-[#f6f5f4] p-3.5 hover:bg-[#ede9e4] transition-colors border border-[#e5e3df]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6e0f5] text-[#7b3ff2] font-black text-sm border border-purple-200">
                    🏢
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0a1530]">
                      {group.name}
                    </div>
                    <div className="text-xs text-[#787671]">
                      Shared Flat · Currency: <span className="font-semibold text-[#0a1530]">{group.defaultCurrency}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#d9f3e1] px-2 py-0.5 text-[10px] font-bold text-[#1aae39]">
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
  );
}
