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

export const instant = false;

export default async function DashboardPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  // Fetch live aggregated balance
  const aggregatedBalances = await getAggregatedBalancesQuery(session.id);
  const netMajor = fromMinorUnits(aggregatedBalances.netTotalMinor);
  const isPositive = aggregatedBalances.netTotalMinor > BigInt(0);
  const isZero = aggregatedBalances.netTotalMinor === BigInt(0);

  // Split integer and cents for superscript rendering
  const absNet = Math.abs(netMajor);
  const integerStr = Math.floor(absNet).toString();
  const centsStr = Math.round((absNet - Math.floor(absNet)) * 100).toString().padStart(2, "0");
  const netDollars = isZero ? "0" : (isPositive ? `+${integerStr}` : `-${integerStr}`);
  const netCents = centsStr;

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

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-20">
      {/* 1. Friendly Greeting */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#0F172A]">
            Hi, {session.name.split(" ")[0]} 👋
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Here is your live shared balance overview
          </p>
        </div>

        <Link
          href="/groups"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <Building2 className="h-3.5 w-3.5 text-[#185CFF]" />
          <span>Apartment 4B</span>
        </Link>
      </div>

      {/* 2. Signature Chime-Inspired Balance Hero Card */}
      <div className={ui.heroCard}>
        {/* Subtle decorative background circles */}
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 h-44 w-44 rounded-full bg-blue-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10">
          {/* Card Type Header */}
          <div className="flex items-center justify-between text-white/80">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <CreditCard className="h-3.5 w-3.5 text-white/90" />
              <span>Net Position · Available Balance</span>
            </div>
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
              Live
            </span>
          </div>

          {/* Large Tabular Balance with Superscript Cents */}
          <div className="mt-4 flex items-baseline">
            <span className="font-mono text-2xl font-bold text-white/80 mr-1.5">
              SAR
            </span>
            <span className="text-[46px] font-black leading-none tabular-nums tracking-tight">
              {netDollars}
            </span>
            <span className="text-[26px] font-bold leading-none tabular-nums text-white/85 ml-0.5">
              .{netCents}
            </span>
          </div>

          <p className="mt-2 text-xs font-semibold text-white/75">
            {isPositive
              ? "Owed to you by flatmates across 1 active group"
              : "All balances currently squared away"}
          </p>

          {/* Embedded Hero Action Buttons */}
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/expenses/new"
              className="flex-1 h-11 rounded-[14px] bg-white text-[#185CFF] hover:bg-white/95 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4 text-[#185CFF]" />
              Add expense
            </Link>
            <Link
              href="/balances"
              className="flex-1 h-11 rounded-[14px] bg-white/15 text-white hover:bg-white/20 font-bold text-xs flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-[0.98]"
            >
              <HandCoins className="h-4 w-4 text-white" />
              Settle up
            </Link>
          </div>
        </div>
      </div>

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
                      {isPayer ? "+SAR 120.00" : "-SAR 40.00"}
                    </div>
                    <div className="text-[11px] font-medium text-slate-400 tabular-nums">
                      Total: SAR 160.00
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
              1 Group
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
