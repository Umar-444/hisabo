"use client";

import { useState } from "react";
import Link from "next/link";
import { ui } from "@/lib/ui";
import {
  CreditCard,
  PlusCircle,
  HandCoins,
  TrendingUp,
  TrendingDown,
  Layers,
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
    <div className="space-y-3">
      {/* Multi-Currency Tab Switcher (Visible when user has groups in > 1 currency) */}
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
                  onClick={() => setSelectedCurrency(code)}
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
                        isSelected ? "bg-white" : curSummary.isPositive ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] font-semibold text-slate-400 pr-2 hidden sm:block">
            Segregated Ledgers
          </div>
        </div>
      )}

      {/* Signature Chime-Inspired Balance Hero Card */}
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
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                {selectedCurrency}
              </span>
              <span className="rounded-full bg-emerald-400/25 text-emerald-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs">
                Live
              </span>
            </div>
          </div>

          {/* Large Tabular Balance with Superscript Cents */}
          <div className="mt-4 flex items-baseline">
            <span className="font-mono text-2xl font-bold text-white/80 mr-1.5">
              {selectedCurrency}
            </span>
            <span className="text-[46px] font-black leading-none tabular-nums tracking-tight">
              {netDollars}
            </span>
            <span className="text-[26px] font-bold leading-none tabular-nums text-white/85 ml-0.5">
              .{currentSummary.centsStr}
            </span>
          </div>

          {/* Subtitle / Status */}
          <p className="mt-2 text-xs font-semibold text-white/80">
            {currentSummary.isPositive
              ? `You are owed a net total of ${selectedCurrency} ${currentSummary.netTotalMajor.toFixed(2)}`
              : currentSummary.isNegative
              ? `You owe a net total of ${selectedCurrency} ${Math.abs(currentSummary.netTotalMajor).toFixed(2)}`
              : `All balances squared away in ${selectedCurrency}`}
          </p>

          {/* Side-by-side Credits & Debits breakdown in selected currency */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-white/15">
            <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-xs">
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-200">
                <TrendingUp className="h-3 w-3" />
                <span>Owed to You</span>
              </div>
              <div className="mt-0.5 text-sm font-black tabular-nums font-mono text-white">
                +{selectedCurrency} {currentSummary.totalCreditMajor.toFixed(2)}
              </div>
            </div>

            <div className="rounded-xl bg-white/10 px-3 py-2 backdrop-blur-xs">
              <div className="flex items-center gap-1 text-[11px] font-bold text-white/80">
                <TrendingDown className="h-3 w-3" />
                <span>You Owe</span>
              </div>
              <div className="mt-0.5 text-sm font-black tabular-nums font-mono text-white">
                -{selectedCurrency} {currentSummary.totalDebitMajor.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Embedded Hero Action Buttons */}
          <div className="mt-5 flex items-center gap-3">
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
    </div>
  );
}
