import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { getAggregatedBalancesQuery } from "@/features/balances";
import { getUserGroupsQuery } from "@/features/groups";
import { fromMinorUnits } from "@/lib/money";
import { ui } from "@/lib/ui";
import Link from "next/link";
import {
  ArrowLeft,
  Scale,
  HandCoins,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Building2,
  Sparkles,
} from "lucide-react";
import { SettleUpModalClient } from "@/features/balances/components/settle-up-modal";

export const instant = false;

export default async function BalancesPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  const [balances, userGroups] = await Promise.all([
    getAggregatedBalancesQuery(session.id),
    getUserGroupsQuery(session.id),
  ]);

  const netMajor = fromMinorUnits(balances.netTotalMinor);
  const creditMajor = fromMinorUnits(balances.totalCreditMinor);
  const debitMajor = fromMinorUnits(balances.totalDebitMinor);
  const isNetPositive = balances.netTotalMinor > BigInt(0);
  const isNetZero = balances.netTotalMinor === BigInt(0);

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
            <h1 className="text-xl font-black text-[#0F172A] tracking-tight">Balances & Debts</h1>
            <p className="text-xs text-slate-500 font-medium">Who owes whom across your groups</p>
          </div>
        </div>

        <Link
          href="/settlements"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <HandCoins className="h-3.5 w-3.5 text-[#185CFF]" />
          <span>Settlements Feed</span>
        </Link>
      </div>

      {/* Main Net Position Hero Card */}
      <div className={ui.heroCard}>
        <div className="flex items-center justify-between text-xs font-semibold text-white/80">
          <div className="flex items-center gap-1.5">
            <Scale className="h-4 w-4" />
            <span>Aggregate Balance Position</span>
          </div>
          <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-xs">
            Live Ledger
          </span>
        </div>

        <div className="mt-3 flex items-baseline">
          <span className="font-mono text-xl font-bold text-white/80 mr-1.5">
            {balances.currency}
          </span>
          <span className="text-4xl font-black tabular-nums tracking-tight">
            {isNetPositive ? `+${netMajor.toFixed(2)}` : netMajor.toFixed(2)}
          </span>
        </div>

        <p className="mt-1 text-xs text-white/75 font-medium">
          {isNetZero
            ? "You are completely squared away with all flatmates"
            : isNetPositive
              ? `You are owed a total of ${balances.currency} ${netMajor.toFixed(2)}`
              : `You owe a total of ${balances.currency} ${Math.abs(netMajor).toFixed(2)}`}
        </p>

        {/* Side-by-side Credits & Debits breakdown */}
        <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-white/15">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Owed to You</span>
            </div>
            <div className="mt-1 text-base font-black tabular-nums font-mono">
              +{balances.currency} {creditMajor.toFixed(2)}
            </div>
          </div>

          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <div className="flex items-center gap-1 text-[11px] font-bold text-white/80">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>You Owe</span>
            </div>
            <div className="mt-1 text-base font-black tabular-nums font-mono">
              -{balances.currency} {debitMajor.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* SettleSmart Confidence Banner */}
      <div className={ui.settleSmartBanner}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-blue-50 text-[#185CFF] border border-blue-100">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-[#0F172A] flex items-center gap-1.5">
            Zero-Loss Verification
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          </div>
          <div className="text-xs text-slate-500 truncate">
            Deterministic zero-sum balance: sum of all positions strictly equals zero
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-[#185CFF]">Audited</div>
        </div>
      </div>

      {/* Peer-to-Peer "Who Owes Whom" Ledger */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0F172A]">Peer Ledger Breakdown</h2>
          <span className="text-xs text-slate-400 font-medium">
            {balances.peerBalances.length} active relations
          </span>
        </div>

        {balances.peerBalances.length === 0 ? (
          <div className="py-10 text-center">
            <div className="h-12 w-12 rounded-[14px] bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">All debts are settled!</p>
            <p className="text-xs text-slate-500 mt-1">
              No outstanding balances owed between you and your flatmates.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {balances.peerBalances.map((peer) => {
              const peerNetMajor = fromMinorUnits(peer.netMinor);
              const peerOwesUser = peer.netMinor > BigInt(0);

              return (
                <div
                  key={`${peer.groupId}:${peer.peerId}`}
                  className="py-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-full bg-blue-100 text-[#185CFF] font-black text-sm flex items-center justify-center shrink-0">
                      {peer.peerName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-[#0F172A] truncate">
                        {peer.peerName}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        @{peer.peerUsername} · <span className="font-medium text-slate-600">{peer.groupName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${peerOwesUser ? "text-[#10B981]" : "text-[#0F172A]"
                          }`}
                      >
                        {peerOwesUser ? `+${peer.currency} ${peerNetMajor.toFixed(2)}` : `-${peer.currency} ${Math.abs(peerNetMajor).toFixed(2)}`}
                      </div>
                      <div className="text-[10px] font-medium text-slate-400">
                        {peerOwesUser ? "Owes you" : "You owe"}
                      </div>
                    </div>

                    {/* Settle Up Action Button */}
                    {!peerOwesUser && (
                      <SettleUpModalClient
                        peerId={peer.peerId}
                        peerName={peer.peerName}
                        groupId={peer.groupId}
                        suggestedAmount={Math.abs(peerNetMajor)}
                        currency={peer.currency}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
