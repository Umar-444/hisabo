"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  PlusCircle,
  HandCoins,
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export interface SerializedCurrencySummary {
  currency: string;
  totalCreditMajor: number;
  totalDebitMajor: number;
  netTotalMajor: number;
  isPositive: boolean;
  isNegative: boolean;
  isZero: boolean;
  integerStr: string;
  centsStr: string;
}

interface DashboardBalanceHeroProps {
  currencies: string[];
  byCurrency: Record<string, SerializedCurrencySummary>;
  initialCurrency: string;
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

export function DashboardBalanceHero({
  currencies,
  byCurrency,
  initialCurrency,
}: DashboardBalanceHeroProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    currencies.includes(initialCurrency) ? initialCurrency : currencies[0] || "SAR"
  );

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

  const netDollars = currentSummary.isZero
    ? "0"
    : currentSummary.isPositive
    ? `+${currentSummary.integerStr}`
    : `-${currentSummary.integerStr}`;

  const hasMultipleCurrencies = currencies.length > 1;

  return (
    <div className="space-y-3.5">
      {/* ------------------------------------------------------------------- */}
      {/* MULTI-CURRENCY NOTION PILL SWITCHER                                 */}
      {/* ------------------------------------------------------------------- */}
      {hasMultipleCurrencies && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-1.5 border border-[#e5e3df] shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-1">
            <span className="text-[11px] font-bold text-[#787671] uppercase tracking-wider pl-1 pr-2 flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-[#185cff]" />
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
                  onClick={() => setSelectedCurrency(code)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#185cff] text-white shadow-xs shadow-[#185cff]/20"
                      : "text-[#5d5b54] hover:text-[#0a1530] hover:bg-[#f6f5f4]"
                  }`}
                >
                  {meta.flag && <span>{meta.flag}</span>}
                  <span>{code}</span>
                  {hasBalance && (
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSelected ? "bg-white" : curSummary.isPositive ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-semibold text-[#787671] pr-2 hidden sm:block">
            Segregated Ledgers
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* NOTION DEEP NAVY HERO BALANCE CARD                                  */}
      {/* ------------------------------------------------------------------- */}
      <div className="relative overflow-hidden rounded-[26px] bg-[#0a1530] text-white p-6 sm:p-7 shadow-[0px_20px_45px_-10px_rgba(10,21,48,0.45)] border border-white/10">
        {/* Subtle Ambient Radial Lighting */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(24,92,255,0.35)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(92,161,255,0.15)_0%,transparent_70%)]" />

        <div className="relative z-10">
          {/* Card Eyebrow & Status Chips */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-blue-200">
                <CreditCard className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Net Position · Live Ledger
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md bg-white/10 px-2 py-0.5 text-[11px] font-bold text-white tracking-wide border border-white/10">
                {selectedCurrency}
              </span>
              {currentSummary.isPositive && (
                <span className="rounded-md bg-[#d9f3e1] text-[#1aae39] px-2 py-0.5 text-[11px] font-bold">
                  You are owed
                </span>
              )}
              {currentSummary.isNegative && (
                <span className="rounded-md bg-[#fde0ec] text-[#e03131] px-2 py-0.5 text-[11px] font-bold">
                  You owe
                </span>
              )}
              {currentSummary.isZero && (
                <span className="rounded-md bg-[#e6e0f5] text-[#7b3ff2] px-2 py-0.5 text-[11px] font-bold">
                  Settled
                </span>
              )}
            </div>
          </div>

          {/* Large Tabular Display Balance */}
          <div className="mt-4 flex items-baseline">
            <span className="text-xl sm:text-2xl font-bold text-slate-400 mr-2 font-mono">
              {selectedCurrency}
            </span>
            <span className="text-4xl sm:text-5xl font-black leading-none tracking-tight tabular-nums">
              {netDollars}
            </span>
            <span className="text-2xl sm:text-3xl font-bold leading-none tabular-nums text-slate-400 ml-0.5">
              .{currentSummary.centsStr}
            </span>
          </div>

          {/* Descriptive Subtitle */}
          <p className="mt-2 text-xs font-medium text-slate-300">
            {currentSummary.isPositive
              ? `You are owed a net total of ${selectedCurrency} ${currentSummary.netTotalMajor.toFixed(2)} from roommates`
              : currentSummary.isNegative
              ? `You owe a net total of ${selectedCurrency} ${Math.abs(currentSummary.netTotalMajor).toFixed(2)} to flatmates`
              : `All shared expenses are balanced to zero in ${selectedCurrency}`}
          </p>

          {/* Side-by-side Credit and Debit breakdown */}
          <div className="mt-5 grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
            <div className="rounded-xl bg-white/5 p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300">
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                <span>Owed to You</span>
              </div>
              <div className="mt-1 text-sm sm:text-base font-extrabold tabular-nums font-mono text-white">
                +{selectedCurrency} {currentSummary.totalCreditMajor.toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl bg-white/5 p-3 border border-white/5">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-300">
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                <span>You Owe</span>
              </div>
              <div className="mt-1 text-sm sm:text-base font-extrabold tabular-nums font-mono text-white">
                -{selectedCurrency} {currentSummary.totalDebitMajor.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-5 flex items-center gap-3">
            <Link
              href="/expenses/new"
              className="flex-1 h-11 rounded-xl bg-[#185cff] text-white hover:bg-[#1249d6] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#185cff]/30 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="h-4 w-4" />
              Add Expense
            </Link>
            <Link
              href="/balances"
              className="flex-1 h-11 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 border border-white/15 transition-all active:scale-[0.98]"
            >
              <HandCoins className="h-4 w-4" />
              Settle Balances
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
