import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { getAggregatedBalancesQuery } from "@/features/balances";
import { fromMinorUnits } from "@/lib/money";
import Link from "next/link";
import { ArrowLeft, HandCoins } from "lucide-react";
import {
  BalancesViewClient,
  SerializedPeerBalance,
} from "@/features/balances/components/balances-view-client";
import { SerializedCurrencySummary } from "@/features/balances/components/dashboard-balance-hero";

export const dynamic = "force-dynamic";

export default async function BalancesPage() {
  const session = await getUserSession();
  if (!session) {
    return null;
  }

  const balances = await getAggregatedBalancesQuery(session.id);

  // Safely serialize byCurrency for Client Component
  const serializedByCurrency: Record<string, SerializedCurrencySummary> = {};
  for (const cur of balances.currencies) {
    const s = balances.byCurrency[cur] || {
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

  const serializedPeers: SerializedPeerBalance[] = balances.peerBalances.map((peer) => ({
    peerId: peer.peerId,
    peerName: peer.peerName,
    peerUsername: peer.peerUsername,
    paymentHandle: peer.paymentHandle ?? null,
    groupId: peer.groupId,
    groupName: peer.groupName,
    currency: peer.currency,
    netMajor: fromMinorUnits(peer.netMinor),
    isOwedToUser: peer.netMinor > BigInt(0),
  }));

  return (
    <div className="w-full space-y-5 pb-24">
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

      {/* Multi-Currency Segregated Balances Ledger */}
      <BalancesViewClient
        currencies={balances.currencies}
        byCurrency={serializedByCurrency}
        initialCurrency={balances.currency}
        peerBalances={serializedPeers}
      />
    </div>
  );
}
