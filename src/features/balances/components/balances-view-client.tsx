"use client";

import { useState } from "react";
import { ui } from "@/lib/ui";
import {
  Scale,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Layers,
  Filter,
} from "lucide-react";
import { SettleUpModalClient } from "./settle-up-modal";
import { SerializedCurrencySummary } from "./dashboard-balance-hero";

export interface SerializedPeerBalance {
  peerId: string;
  peerName: string;
  peerUsername: string;
  groupId: string;
  groupName: string;
  currency: string;
  netMajor: number;
  isOwedToUser: boolean;
}

interface BalancesViewClientProps {
  currencies: string[];
  byCurrency: Record<string, SerializedCurrencySummary>;
  initialCurrency: string;
  peerBalances: SerializedPeerBalance[];
}

const CURRENCY_SYMBOLS: Record<string, { symbol: string; label: string; flag?: string }> = {
  SAR: { symbol: "ر.س", label: "Saudi Riyal", flag: "🇸🇦" },
  AED: { symbol: "د.إ", label: "UAE Dirham", flag: "🇦🇪" },
  USD: { symbol: "$", label: "US Dollar", flag: "🇺🇸" },
  EUR: { symbol: "€", label: "Euro", flag: "🇪🇺" },
  GBP: { symbol: "£", label: "British Pound", flag: "🇬🇧" },
  KWD: { symbol: "د.ك", label: "Kuwaiti Dinar", flag: "🇰🇼" },
  QAR: { symbol: "ر.ق", label: "Qatari Riyal", flag: "🇶🇦" },
  BHD: { symbol: "ب.د", label: "Bahraini Dinar", flag: "🇧🇭" },
  OMR: { symbol: "ر.ع", label: "Omani Rial", flag: "🇴🇲" },
};

export function BalancesViewClient({
  currencies,
  byCurrency,
  initialCurrency,
  peerBalances,
}: BalancesViewClientProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    currencies.includes(initialCurrency) ? initialCurrency : currencies[0] || "SAR"
  );
  const [peerFilterCurrency, setPeerFilterCurrency] = useState<string>("ALL");

  const currentSummary = byCurrency[selectedCurrency] || {
    currency: selectedCurrency,
    totalCreditMajor: 0,
    totalDebitMajor: 0,
    netTotalMajor: 0,
    isPositive: false,
    isNegative: false,
    isZero: true,
    integerStr: "0",
    centsStr: "00",
  };

  const isNetPositive = currentSummary.isPositive;
  const isNetZero = currentSummary.isZero;
  const netMajor = currentSummary.netTotalMajor;

  const hasMultipleCurrencies = currencies.length > 1;

  // Filter peers
  const filteredPeers =
    peerFilterCurrency === "ALL"
      ? peerBalances
      : peerBalances.filter((p) => p.currency === peerFilterCurrency);

  return (
    <div className="space-y-5">
      {/* Multi-Currency Tab Switcher (When user has groups in > 1 currency) */}
      {hasMultipleCurrencies && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-1.5 border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pl-1 pr-2 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              Currency:
            </span>
            {currencies.map((code) => {
              const meta = CURRENCY_SYMBOLS[code] || { symbol: code, label: code };
              const isSelected = selectedCurrency === code;
              const curSummary = byCurrency[code];
              const hasBalance = curSummary && !curSummary.isZero;

              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    setSelectedCurrency(code);
                    setPeerFilterCurrency(code);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#185CFF] text-white shadow-xs shadow-blue-500/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {meta.flag && <span>{meta.flag}</span>}
                  <span>{code}</span>
                  {hasBalance && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected
                          ? "bg-white"
                          : curSummary.isPositive
                          ? "bg-emerald-500"
                          : "bg-red-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-semibold text-slate-400 pr-2 hidden sm:block">
            Segregated Positions
          </div>
        </div>
      )}

      {/* Main Net Position Hero Card (Currency-Partitioned) */}
      <div className={ui.heroCard}>
        <div className="flex items-center justify-between text-xs font-semibold text-white/80">
          <div className="flex items-center gap-1.5">
            <Scale className="h-4 w-4" />
            <span>Position in {selectedCurrency}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-xs">
              {selectedCurrency}
            </span>
            <span className="rounded-full bg-emerald-400/25 text-emerald-100 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-xs">
              Live Ledger
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-baseline">
          <span className="font-mono text-xl font-bold text-white/80 mr-1.5">
            {selectedCurrency}
          </span>
          <span className="text-4xl font-black tabular-nums tracking-tight">
            {isNetPositive ? `+${netMajor.toFixed(2)}` : netMajor.toFixed(2)}
          </span>
        </div>

        <p className="mt-1 text-xs text-white/75 font-medium">
          {isNetZero
            ? `You are completely squared away in ${selectedCurrency}`
            : isNetPositive
            ? `You are owed a total of ${selectedCurrency} ${netMajor.toFixed(2)}`
            : `You owe a total of ${selectedCurrency} ${Math.abs(netMajor).toFixed(2)}`}
        </p>

        {/* Side-by-side Credits & Debits breakdown in selected currency */}
        <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-white/15">
          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-200">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Owed to You</span>
            </div>
            <div className="mt-1 text-base font-black tabular-nums font-mono text-white">
              +{selectedCurrency} {currentSummary.totalCreditMajor.toFixed(2)}
            </div>
          </div>

          <div className="rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <div className="flex items-center gap-1 text-[11px] font-bold text-white/80">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>You Owe</span>
            </div>
            <div className="mt-1 text-base font-black tabular-nums font-mono text-white">
              -{selectedCurrency} {currentSummary.totalDebitMajor.toFixed(2)}
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
            Zero-Loss Mathematical Verification
            <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" />
          </div>
          <div className="text-xs text-slate-500 truncate">
            Deterministic zero-sum balance: sum of all positions in {selectedCurrency} strictly equals zero
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-bold text-[#185CFF]">Audited</div>
        </div>
      </div>

      {/* Peer-to-Peer "Who Owes Whom" Ledger */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#0F172A]">Peer Ledger Breakdown</h2>
            <p className="text-xs text-slate-400 font-medium">
              {filteredPeers.length} active relationships
            </p>
          </div>

          {/* Filter Pills for Peer List */}
          {hasMultipleCurrencies && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <Filter className="h-3 w-3 text-slate-400 ml-1.5 mr-0.5" />
              <button
                type="button"
                onClick={() => setPeerFilterCurrency("ALL")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  peerFilterCurrency === "ALL"
                    ? "bg-white text-[#0F172A] shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                All
              </button>
              {currencies.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setPeerFilterCurrency(code)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    peerFilterCurrency === code
                      ? "bg-white text-[#185CFF] shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          )}
        </div>

        {filteredPeers.length === 0 ? (
          <div className="py-10 text-center">
            <div className="h-12 w-12 rounded-[14px] bg-emerald-50 text-[#10B981] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-[#0F172A]">All debts are settled!</p>
            <p className="text-xs text-slate-500 mt-1">
              {peerFilterCurrency === "ALL"
                ? "No outstanding balances owed between you and your flatmates across any currency."
                : `No outstanding balances owed in ${peerFilterCurrency}.`}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredPeers.map((peer) => {
              const peerOwesUser = peer.isOwedToUser;

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
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                        <span>@{peer.peerUsername}</span>
                        <span>·</span>
                        <span className="font-medium text-slate-600">{peer.groupName}</span>
                        <span className="rounded-md bg-slate-100 text-slate-600 px-1.5 py-0.5 text-[10px] font-bold uppercase font-mono">
                          {peer.currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <div
                        className={`text-sm font-bold font-mono tabular-nums ${
                          peerOwesUser ? "text-[#10B981]" : "text-[#0F172A]"
                        }`}
                      >
                        {peerOwesUser
                          ? `+${peer.currency} ${peer.netMajor.toFixed(2)}`
                          : `-${peer.currency} ${Math.abs(peer.netMajor).toFixed(2)}`}
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
                        suggestedAmount={Math.abs(peer.netMajor)}
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
