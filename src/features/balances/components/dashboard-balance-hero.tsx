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
        <div className="flex items-center justify-between bg-white rounded-lg p-1 border border-[#e5e3df] shadow-2xs">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-1">
            <span className="text-[10px] font-bold text-[#787671] uppercase tracking-wider pl-1 pr-2 flex items-center gap-1">
              <Layers className="h-3 w-3 text-[#185cff]" />
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
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#185CFF] text-white shadow-2xs"
                      : "text-[#787671] hover:text-[#1a1a1a] hover:bg-[#f6f5f4]"
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

          <div className="text-[10px] font-semibold text-[#787671] pr-2 hidden sm:block">
            Partitioned
          </div>
        </div>
      )}

      {/* Signature Sharp Balance Hero Card */}
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
              <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs border border-white/10">
                {selectedCurrency}
              </span>
              <span className="rounded-md bg-emerald-400/25 text-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-emerald-300/20">
                Live
              </span>
            </div>
          </div>

          {/* Large Tabular Balance with Superscript Cents */}
          <div className="mt-4 flex items-baseline">
            <span className="font-mono text-2xl font-bold text-white/80 mr-1.5">
              {selectedCurrency}
            </span>
            <span className="text-[44px] font-black leading-none tabular-nums tracking-tight">
              {netDollars}
            </span>
            <span className="text-[24px] font-bold leading-none tabular-nums text-white/85 ml-0.5">
              .{currentSummary.centsStr}
            </span>
          </div>

          {/* Subtitle / Status */}
          <p className="mt-2 text-xs font-medium text-white/80">
            {currentSummary.isPositive
              ? `You are owed a net total of ${selectedCurrency} ${currentSummary.netTotalMajor.toFixed(2)}`
              : currentSummary.isNegative
              ? `You owe a net total of ${selectedCurrency} ${Math.abs(currentSummary.netTotalMajor).toFixed(2)}`
              : `All balances squared away in ${selectedCurrency}`}
          </p>

          {/* Side-by-side Colored Budget & Position Sections (Notion Style) */}
          <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-white/15">
            <div className="rounded-lg bg-emerald-950/35 border border-emerald-400/30 px-3 py-2.5 backdrop-blur-xs">
              <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-200">
                <TrendingUp className="h-3 w-3" />
                <span>Owed to You</span>
              </div>
              <div className="mt-1 text-sm font-black tabular-nums font-mono text-white">
                +{selectedCurrency} {currentSummary.totalCreditMajor.toFixed(2)}
              </div>
            </div>

            <div className="rounded-lg bg-rose-950/35 border border-rose-400/30 px-3 py-2.5 backdrop-blur-xs">
              <div className="flex items-center gap-1 text-[11px] font-bold text-rose-200">
                <TrendingDown className="h-3 w-3" />
                <span>You Owe</span>
              </div>
              <div className="mt-1 text-sm font-black tabular-nums font-mono text-white">
                -{selectedCurrency} {currentSummary.totalDebitMajor.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Embedded Hero Action Buttons */}
          <div className="mt-5 flex items-center gap-2.5">
            <Link
              href="/expenses/new"
              prefetch={false}
              className="flex-1 h-10 rounded-lg bg-white text-[#185CFF] hover:bg-white/95 font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-all active:scale-[0.98]"
            >
              <PlusCircle className="h-3.5 w-3.5 text-[#185CFF]" />
              Add expense
            </Link>
            <Link
              href="/balances"
              prefetch={false}
              className="flex-1 h-10 rounded-lg bg-white/15 text-white hover:bg-white/20 font-semibold text-xs flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md transition-all active:scale-[0.98]"
            >
              <HandCoins className="h-3.5 w-3.5 text-white" />
              Settle up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
