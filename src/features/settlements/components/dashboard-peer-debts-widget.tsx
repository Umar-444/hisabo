"use client";

import { useState } from "react";
import { PaymentRequestButton } from "./payment-request-button";
import { RemindAllButton } from "./remind-all-button";
import { QuickPaySheet } from "./quick-pay-sheet";
import { TrendingUp, TrendingDown, ArrowRight, HandCoins } from "lucide-react";
import Link from "next/link";

export interface DashboardPeerItem {
  peerId: string;
  peerName: string;
  peerUsername: string;
  groupId: string;
  groupName: string;
  currency: string;
  amountMajor: number;
  isOwedToUser: boolean;
  isAdminOfGroup?: boolean;
}

interface Props {
  peers: DashboardPeerItem[];
  activeRequestsMap?: Record<string, string>;
}

export function DashboardPeerDebtsWidget({ peers, activeRequestsMap = {} }: Props) {
  const [quickPayTarget, setQuickPayTarget] = useState<DashboardPeerItem | null>(null);

  const owedToUserList = peers.filter((p) => p.isOwedToUser);
  const userOwesList = peers.filter((p) => !p.isOwedToUser);

  if (owedToUserList.length === 0 && userOwesList.length === 0) {
    return null;
  }

  // Find unique groups where user is admin and has debtors
  const adminGroupIds = Array.from(
    new Set(owedToUserList.filter((p) => p.isAdminOfGroup).map((p) => p.groupId))
  );

  return (
    <div className="space-y-3">
      {/* 1. "You Are Owed" Card with Request & Remind All */}
      {owedToUserList.length > 0 && (
        <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <TrendingUp className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                You Are Owed
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {adminGroupIds.length > 0 && (
                <RemindAllButton groupId={adminGroupIds[0]} />
              )}
              <Link
                href="/balances"
                className="text-[11px] font-semibold text-[#185CFF] hover:underline flex items-center gap-0.5"
              >
                <span>Balances</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {owedToUserList.map((peer) => (
              <div
                key={`${peer.groupId}:${peer.peerId}`}
                className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {peer.peerName}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {peer.groupName} · @{peer.peerUsername}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-emerald-600 tabular-nums">
                      +{peer.currency} {peer.amountMajor.toFixed(2)}
                    </div>
                  </div>

                  <PaymentRequestButton
                    groupId={peer.groupId}
                    debtorId={peer.peerId}
                    debtorName={peer.peerName}
                    amount={peer.amountMajor}
                    currency={peer.currency}
                    lastRequestedAt={activeRequestsMap[`${peer.groupId}:${peer.peerId}`]}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. "You Owe" Card with Tappable Quick-Pay */}
      {userOwesList.length > 0 && (
        <div className="rounded-xl border border-rose-200/80 bg-white p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <TrendingDown className="h-3.5 w-3.5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                You Owe
              </h3>
            </div>

            <Link
              href="/balances"
              className="text-[11px] font-semibold text-[#185CFF] hover:underline flex items-center gap-0.5"
            >
              <span>Balances</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {userOwesList.map((peer) => (
              <div
                key={`${peer.groupId}:${peer.peerId}`}
                className="py-2.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {peer.peerName}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">
                    {peer.groupName} · @{peer.peerUsername}
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold font-mono text-rose-600 tabular-nums">
                      -{peer.currency} {peer.amountMajor.toFixed(2)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setQuickPayTarget(peer)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#185CFF] text-white text-[11px] font-bold hover:bg-[#1249D6] transition-colors shadow-2xs cursor-pointer active:scale-95"
                  >
                    <HandCoins className="h-3 w-3" />
                    <span>Quick Pay</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Pay Sheet Modal */}
      {quickPayTarget && (
        <QuickPaySheet
          isOpen={true}
          onClose={() => setQuickPayTarget(null)}
          groupId={quickPayTarget.groupId}
          groupName={quickPayTarget.groupName}
          payeeId={quickPayTarget.peerId}
          payeeName={quickPayTarget.peerName}
          outstandingAmount={quickPayTarget.amountMajor}
          currency={quickPayTarget.currency}
          onSuccess={() => setQuickPayTarget(null)}
        />
      )}
    </div>
  );
}
