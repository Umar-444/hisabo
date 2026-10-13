import { getUserSession } from "@/lib/auth/user-session";
import { redirect, notFound } from "next/navigation";
import {
  getGroupDetailQuery,
  getGroupInvitesListQuery,
  getGroupActivityLogQuery,
} from "@/features/groups";
import { getGroupExpensesQuery } from "@/features/expenses";
import { fromMinorUnits } from "@/lib/money";
import { ui } from "@/lib/ui";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  PlusCircle,
  HandCoins,
  ShieldCheck,
  Building2,
  Share2,
  Calendar,
  Lock,
} from "lucide-react";
import { GroupInviteModalClient } from "@/features/groups/components/group-invite-modal";
import { GroupGovernanceCard } from "@/features/groups/components/group-governance-card";
import { GroupActivityList } from "@/features/groups/components/group-activity-list";

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

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const group = await getGroupDetailQuery(id, session.id);

  if (!group) {
    notFound();
  }

  const [expensesList, existingInvites, activityLog] = await Promise.all([
    getGroupExpensesQuery(id),
    getGroupInvitesListQuery(id, session.id),
    getGroupActivityLogQuery(id),
  ]);
  const userNetMajor = fromMinorUnits(group.userNetBalanceMinor);
  const isPositive = group.userNetBalanceMinor > BigInt(0);
  const isZero = group.userNetBalanceMinor === BigInt(0);
  const isArchived = (group as any).status === "archived";

  return (
    <div className="w-full space-y-5 pb-24">
      {/* Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/groups"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Group Ledger
        </span>
        <GroupInviteModalClient
          groupId={group.id}
          groupName={group.name}
          existingInvites={existingInvites}
        />
      </div>

      {/* Archived Notice Banner */}
      {isArchived && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-slate-100 p-3.5 shadow-2xs">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-700 text-white">
            <Lock className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900">
              Archived Group Pool (Read-Only)
            </div>
            <div className="text-[11px] text-slate-600">
              This apartment/trip pool has been closed. Historical records and receipts are preserved.
            </div>
          </div>
        </div>
      )}

      {/* Group Hero Info */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#EBF2FF] text-[#185CFF] font-black text-xl border border-blue-100">
              🏢
            </div>
            <div>
              <h1 className="text-xl font-black text-[#0F172A] tracking-tight">{group.name}</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {group.members.length} flatmates · Currency: {group.defaultCurrency}
              </p>
            </div>
          </div>

          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            {group.currentUserRole}
          </span>
        </div>

        {/* Group Net Position Card */}
        <div className="mt-5 rounded-[18px] bg-gradient-to-br from-[#185CFF] via-[#1552E6] to-[#0D40C9] p-5 text-white shadow-lg shadow-[#185CFF]/20">
          <div className="flex items-center justify-between text-xs font-semibold text-white/80">
            <span>Your Position in this Group</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold backdrop-blur-xs">
              Live Zero-Sum
            </span>
          </div>

          <div className="mt-2 flex items-baseline">
            <span className="font-mono text-lg font-bold text-white/80 mr-1.5">
              {group.defaultCurrency}
            </span>
            <span className="text-3xl font-black tabular-nums tracking-tight">
              {isPositive ? `+${userNetMajor.toFixed(2)}` : userNetMajor.toFixed(2)}
            </span>
          </div>

          <p className="mt-1 text-xs text-white/75 font-medium">
            {isZero
              ? "All balances squared away"
              : isPositive
              ? "Flatmates owe you in this pool"
              : "You owe flatmates in this pool"}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <Link
              href={`/expenses/new?groupId=${group.id}`}
              className="flex-1 h-9 rounded-xl bg-white text-[#185CFF] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Add Expense
            </Link>
            <Link
              href="/balances"
              className="flex-1 h-9 rounded-xl bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 backdrop-blur-xs transition-all active:scale-[0.98]"
            >
              <HandCoins className="h-3.5 w-3.5" />
              Settle Up
            </Link>
          </div>
        </div>
      </div>

      {/* Group Members Section */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
            <Users className="h-4 w-4 text-[#185CFF]" />
            Members & Balances ({group.members.length})
          </h2>
          <GroupInviteModalClient
            groupId={group.id}
            groupName={group.name}
            existingInvites={existingInvites}
          />
        </div>

        <div className="divide-y divide-slate-100">
          {group.members.map((member) => {
            const memberNetMajor = fromMinorUnits(member.netBalanceMinor);
            const isUser = member.userId === session.id;
            const isMemberPositive = member.netBalanceMinor > BigInt(0);

            return (
              <div key={member.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-blue-100 text-[#185CFF] font-black text-xs flex items-center justify-center">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">
                      {member.name} {isUser ? "(You)" : ""}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      @{member.username} · <span className="capitalize">{member.role}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-bold font-mono tabular-nums ${
                      isMemberPositive
                        ? "text-[#10B981]"
                        : member.netBalanceMinor < BigInt(0)
                        ? "text-[#0F172A]"
                        : "text-slate-400"
                    }`}
                  >
                    {isMemberPositive ? `+${memberNetMajor.toFixed(2)}` : memberNetMajor.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {isMemberPositive ? "Owed by pool" : member.netBalanceMinor < BigInt(0) ? "Owes pool" : "Settled"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Group Expenses Section */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A]">Group Expense History</h2>
          <Link
            href={`/expenses/new?groupId=${group.id}`}
            className="text-xs font-bold text-[#185CFF] hover:underline"
          >
            + Add Expense
          </Link>
        </div>

        {expensesList.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No expenses recorded for this group yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {expensesList.map((exp) => {
              const isPayer = exp.paidById === session.id;
              const emoji = CATEGORY_EMOJIS[exp.category] || "🧾";
              const majorAmount = fromMinorUnits(exp.amountMinor);

              return (
                <Link
                  key={exp.id}
                  href={`/expenses/${exp.id}`}
                  className={ui.transactionRow}
                >
                  <div className={ui.categoryTile}>
                    <span>{emoji}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-[#0F172A] truncate">
                      {exp.description}
                    </div>
                    <div className="text-[12px] text-slate-500">
                      Paid by {isPayer ? "you" : exp.paidByName}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-[15px] font-bold tabular-nums ${
                        isPayer ? "text-[#10B981]" : "text-[#0F172A]"
                      }`}
                    >
                      {exp.currency} {majorAmount.toFixed(2)}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Group Governance & Closure Controls (TASK-13) */}
      <GroupGovernanceCard
        groupId={group.id}
        groupName={group.name}
        isOwner={group.currentUserRole === "owner"}
        status={(group as any).status || "active"}
        userNetBalanceMinor={group.userNetBalanceMinor.toString()}
        currency={group.defaultCurrency}
      />

      {/* Group Activity & Audit Log Feed (TASK-14) */}
      <GroupActivityList activityLog={activityLog} />
    </div>
  );
}
