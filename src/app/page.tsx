"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Download,
  ExternalLink,
  Layers,
  Database,
  Cpu,
  Lock,
  RefreshCw,
  Bell,
  Check,
  ChevronRight,
  Zap,
  Globe,
  SlidersHorizontal,
  Users,
} from "lucide-react";

export default function HomePage() {
  // Interactive currency switcher state for Mobile Screen 1
  const [activeCurrency, setActiveCurrency] = useState<"SAR" | "USD" | "AED">("SAR");
  // Interactive split tab state for Mobile Screen 2
  const [splitTab, setSplitTab] = useState<"equal" | "custom">("equal");
  // Simulated settlement claim confirmation state
  const [claimConfirmed, setClaimConfirmed] = useState(false);

  // Dynamic values based on activeCurrency
  const currencyData = {
    SAR: {
      symbol: "SAR",
      netBalance: "+240.00",
      owedToYou: "320.00",
      youOwe: "80.00",
      claimAmount: "40.00",
      recentBill: "160.00",
      recentNet: "+120.00",
    },
    USD: {
      symbol: "$",
      netBalance: "+64.00",
      owedToYou: "85.33",
      youOwe: "21.33",
      claimAmount: "10.67",
      recentBill: "42.67",
      recentNet: "+32.00",
    },
    AED: {
      symbol: "AED",
      netBalance: "+235.00",
      owedToYou: "313.33",
      youOwe: "78.33",
      claimAmount: "39.17",
      recentBill: "156.67",
      recentNet: "+117.50",
    },
  }[activeCurrency];

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1a1a1a] selection:bg-[#185cff]/15 selection:text-[#185cff]">
      {/* ========================================================================= */}
      {/* NOTION-STYLE STICKY NAVIGATION BAR                                        */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 border-b border-[#e5e3df] bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#185cff] text-white shadow-sm shadow-[#185cff]/30 transition-transform group-hover:scale-105">
              <span className="text-lg font-black tracking-tighter">H</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-[#0a1530]">
                Hisabo
              </span>
              <span className="hidden rounded-full bg-[#e6e0f5] px-2 py-0.5 text-[11px] font-semibold text-[#7b3ff2] sm:inline-block">
                PWA Standalone
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-[#787671] md:flex">
            <a href="#features" className="transition-colors hover:text-[#0a1530]">
              Product Features
            </a>
            <a href="#story" className="transition-colors hover:text-[#0a1530]">
              Ledger Math
            </a>
            <a href="#download" className="transition-colors hover:text-[#0a1530]">
              Download PWA
            </a>
            <a href="#developers" className="transition-colors hover:text-[#0a1530]">
              Developer Hub
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="rounded-md px-3.5 py-2 text-sm font-medium text-[#37352f] transition-colors hover:bg-[#f6f5f4]"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-[#185cff] px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#1249d6] active:scale-95"
            >
              Get Hisabo Free
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* SECTION 1: DEEP NAVY HERO BAND & MOBILE SCREEN 1 MOCKUP                   */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden bg-[#0a1530] text-white pt-16 pb-24 lg:pt-20 lg:pb-32 border-b border-[#070f24]">
        {/* Subtle background ambient mesh */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(24,92,255,0.22)_0%,transparent_65%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Notion-style pill eyebrow with sticky notes */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#185cff]" />
            Split easy. Settle smart.
          </div>

          {/* Floating Atmospheric Sticky Tags (Notion Design Inspired) */}
          <div className="relative mx-auto max-w-4xl">
            <div className="hidden lg:block absolute -left-12 top-4 rounded-md bg-[#ffe8d4] text-[#793400] text-xs font-bold px-2.5 py-1 shadow-md rotate-[-4deg]">
              💡 Zero-Loss Halala Ledger
            </div>
            <div className="hidden lg:block absolute -right-12 top-2 rounded-md bg-[#d9f3e1] text-[#1aae39] text-xs font-bold px-2.5 py-1 shadow-md rotate-[3deg]">
              ⚡ Two-Party Handshake
            </div>

            {/* Main Display Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.08]">
              The auditable shared-expense ledger for{" "}
              <span className="text-[#5ca1ff]">flatmates & trips.</span>
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              Track shared bills, split costs with integer precision, and verify offline payments with two-party creditor confirmations. No disappearing debts, no rounding drift, and zero awkward talks.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#185cff] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#185cff]/30 transition-all hover:bg-[#1249d6] active:scale-95"
              >
                Start Splitting Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                Explore Live Demo
              </a>
            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* MOBILE SCREEN 1 MOCKUP: Live Dashboard & Real-Time Balance Hero       */}
          {/* --------------------------------------------------------------------- */}
          <div className="mt-14 sm:mt-18 flex justify-center">
            {/* Phone Outer Frame with Notion Mockup Level-3 Shadow */}
            <div className="relative w-full max-w-[380px] sm:max-w-[410px] rounded-[44px] bg-[#1a2a52]/80 p-3 sm:p-3.5 shadow-[0px_24px_60px_-10px_rgba(0,0,0,0.55)] border border-white/15 backdrop-blur-xl">
              {/* Phone Inner Bezel */}
              <div className="overflow-hidden rounded-[36px] bg-[#F1F5F9] text-[#0F172A] shadow-inner">
                {/* Status Bar */}
                <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[11px] font-semibold text-slate-700 bg-white">
                  <span>9:41</span>
                  {/* Dynamic Island / Notch */}
                  <div className="h-4 w-20 rounded-full bg-slate-900 mx-auto" />
                  <div className="flex items-center gap-1.5 text-slate-800">
                    <span className="text-[10px]">5G</span>
                    <div className="h-2.5 w-5 rounded-xs border border-slate-700 p-0.5">
                      <div className="h-full w-3/4 rounded-xs bg-slate-800" />
                    </div>
                  </div>
                </div>

                {/* Mockup Header */}
                <div className="flex items-center justify-between bg-white px-5 py-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#185cff] text-white font-bold text-xs">
                      U
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-[#0F172A]">Umar&apos;s Ledger</div>
                      <div className="text-[10px] text-slate-400">Riyadh Household Flat</div>
                    </div>
                  </div>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                  </div>
                </div>

                {/* Mockup Screen Body */}
                <div className="p-4 space-y-3.5 text-left bg-[#F1F5F9]">
                  {/* Currency Switcher Tabs */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Partitioned Balance
                    </span>
                    <div className="flex items-center rounded-full bg-slate-200/80 p-0.5 text-[10px] font-bold">
                      {(["SAR", "USD", "AED"] as const).map((curr) => (
                        <button
                          key={curr}
                          onClick={() => setActiveCurrency(curr)}
                          className={`rounded-full px-2.5 py-0.5 transition-all ${
                            activeCurrency === curr
                              ? "bg-white text-[#185cff] shadow-xs"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Net Balance Card (Hisabo Royal Blue Theme) */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#185cff] via-[#1552e6] to-[#0d40c9] p-4 text-white shadow-md shadow-[#185cff]/20">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-blue-100">
                        Net Position ({activeCurrency})
                      </span>
                      <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200 border border-emerald-300/30">
                        You are owed
                      </span>
                    </div>

                    <div className="mt-2 text-2xl font-black tracking-tight">
                      {currencyData.netBalance} <span className="text-sm font-semibold">{currencyData.symbol}</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/15 pt-2.5 text-[10px]">
                      <div>
                        <div className="text-blue-200">Owed to you</div>
                        <div className="font-bold text-white text-xs mt-0.5">
                          +{currencyData.owedToYou} {currencyData.symbol}
                        </div>
                      </div>
                      <div className="border-l border-white/15 pl-2">
                        <div className="text-blue-200">You owe</div>
                        <div className="font-bold text-white text-xs mt-0.5">
                          -{currencyData.youOwe} {currencyData.symbol}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pending Settlement Claim Card (Task 3 Feature) */}
                  <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 shadow-2xs">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-900">
                        <Zap className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                        Pending Settlement Claim
                      </div>
                      <span className="rounded-full bg-amber-200/70 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                        Needs Action
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-amber-800">
                      Ali recorded a <strong>{currencyData.claimAmount} {currencyData.symbol}</strong> cash payment to you.
                    </div>

                    <div className="mt-2.5 flex items-center gap-2">
                      {claimConfirmed ? (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg w-full justify-center">
                          <Check className="h-3 w-3" />
                          Receipt Confirmed · Debt Deducted
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => setClaimConfirmed(true)}
                            className="flex-1 rounded-lg bg-[#185cff] py-1 text-center text-[10px] font-bold text-white shadow-2xs hover:bg-[#1249d6]"
                          >
                            Confirm Receipt
                          </button>
                          <button
                            onClick={() => alert("Dispute flow opened: payment remains unconfirmed.")}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Review
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Recent Group Activity */}
                  <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#0F172A]">Dinner at Al Baik</span>
                      <span className="font-extrabold text-[#10B981]">
                        {currencyData.recentNet} {currencyData.symbol}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500">
                      <span>Total: {currencyData.recentBill} {currencyData.symbol} · Paid by Umar</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-medium">
                        4 equal shares
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Navigation Mock Bar */}
                <div className="flex items-center justify-around border-t border-slate-200/80 bg-white py-2 text-[9px] font-bold text-slate-500">
                  <div className="text-[#185cff] flex flex-col items-center">
                    <Layers className="h-4 w-4" />
                    <span>Ledger</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Users className="h-4 w-4" />
                    <span>Groups</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Balances</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: MOBILE SCREEN 2 & 4 PASTEL STORY/FEATURE CARDS                 */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 lg:py-28 bg-[#fafaf9] border-b border-[#e5e3df]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Editorial Header */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#e6e0f5] px-2.5 py-1 text-xs font-semibold text-[#7b3ff2] mb-3">
              <Lock className="h-3 w-3" />
              Notion Design System · 4 Financial Pillars
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl text-[#0a1530]">
              Built for flats, roommates, and group travels.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-[#5d5b54] leading-relaxed">
              Casual calculator apps round off fractions and let unpaid debts quietly vanish. Hisabo enforces strict zero-loss mathematics, multi-currency partitioning, and two-party offline settlement confirmation.
            </p>
          </div>

          {/* Grid Layout: Mobile Screen 2 (Left/Center) + 4 Pastel Cards (Right/Grid) */}
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ------------------------------------------------------------------- */}
            {/* MOBILE SCREEN 2 MOCKUP: Group Expense & Split Engine View          */}
            {/* ------------------------------------------------------------------- */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-[360px] sm:max-w-[380px] rounded-[40px] bg-[#0a1530] p-3 shadow-xl border border-slate-300">
                <div className="overflow-hidden rounded-[32px] bg-white text-[#0F172A]">
                  {/* Phone Header */}
                  <div className="bg-[#0a1530] text-white px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-blue-200">Group Expense</div>
                      <div className="text-sm font-extrabold">Riyadh Flat #402</div>
                    </div>
                    <span className="rounded-full bg-blue-500/30 px-2 py-0.5 text-[10px] font-bold text-blue-200 border border-blue-400/30">
                      SAR Group
                    </span>
                  </div>

                  {/* Split Details Container */}
                  <div className="p-4 space-y-3.5 bg-slate-50/60">
                    {/* Bill Info Card */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
                      <div className="text-xs text-slate-500">Expense Title</div>
                      <div className="text-base font-extrabold text-[#0F172A]">
                        Monthly Fiber Internet
                      </div>
                      <div className="mt-1 flex items-baseline justify-between border-t border-slate-100 pt-2">
                        <span className="text-xs text-slate-500">Total Amount:</span>
                        <span className="text-lg font-black text-[#0F172A]">SAR 320.00</span>
                      </div>
                    </div>

                    {/* Split Type Selector */}
                    <div className="flex rounded-lg bg-slate-200/80 p-0.5 text-[11px] font-bold">
                      <button
                        onClick={() => setSplitTab("equal")}
                        className={`flex-1 rounded-md py-1 transition-all ${
                          splitTab === "equal"
                            ? "bg-white text-[#185cff] shadow-2xs"
                            : "text-slate-600"
                        }`}
                      >
                        Equal Split (4 Flatmates)
                      </button>
                      <button
                        onClick={() => setSplitTab("custom")}
                        className={`flex-1 rounded-md py-1 transition-all ${
                          splitTab === "custom"
                            ? "bg-white text-[#185cff] shadow-2xs"
                            : "text-slate-600"
                        }`}
                      >
                        Custom Halalas
                      </button>
                    </div>

                    {/* Member Splits Ledger Breakdown */}
                    <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2 shadow-2xs text-xs">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Derived Member Positions
                      </div>

                      {/* Umar (Payer) */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[#185cff] text-[10px] font-bold">
                            U
                          </span>
                          <span className="font-bold text-slate-800">Umar (Payer)</span>
                        </div>
                        <span className="font-extrabold text-emerald-600">+SAR 240.00</span>
                      </div>

                      {/* Ali */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            A
                          </span>
                          <span className="text-slate-700">Ali</span>
                        </div>
                        <span className="font-bold text-rose-500">-SAR 80.00</span>
                      </div>

                      {/* Ahmed */}
                      <div className="flex items-center justify-between py-1 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            A
                          </span>
                          <span className="text-slate-700">Ahmed</span>
                        </div>
                        <span className="font-bold text-rose-500">-SAR 80.00</span>
                      </div>

                      {/* Bilal */}
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                            B
                          </span>
                          <span className="text-slate-700">Bilal</span>
                        </div>
                        <span className="font-bold text-rose-500">-SAR 80.00</span>
                      </div>
                    </div>

                    {/* Zero-Loss Invariant Badge */}
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-[10px] text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Invariant Passed:</strong> 80 × 4 = 320 SAR. Zero halala rounding loss.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------------- */}
            {/* 4 NOTION PASTEL STORY & FEATURE CARDS (Right 7 Columns)             */}
            {/* ------------------------------------------------------------------- */}
            <div id="story" className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* CARD 1: PEACH TINT (Zero-Loss Integer Calculations) */}
              <div className="rounded-2xl bg-[#ffe8d4] border border-[#f5d0b5] p-6 text-[#37352f] transition-transform hover:-translate-y-1 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-[#793400] text-white px-2 py-0.5 text-[11px] font-bold mb-3">
                    📐 Precision Math
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[#523410]">
                    Zero-Loss Integer Engine
                  </h3>
                  <p className="mt-2.5 text-sm text-[#793400]/90 leading-relaxed font-normal">
                    All balances are stored and calculated in integer minor units (halalas and cents). Remainder halalas are distributed deterministically so the sum of participant shares exactly equals the expense total.
                  </p>
                </div>
                <div className="mt-4 rounded-xl bg-white/70 p-2.5 text-xs text-[#523410] font-mono border border-[#f5d0b5]">
                  100 SAR ÷ 3 = 33.34 + 33.33 + 33.33
                </div>
              </div>

              {/* CARD 2: MINT TINT (Two-Party Settlement Handshake) */}
              <div className="rounded-2xl bg-[#d9f3e1] border border-[#b8e8c6] p-6 text-[#37352f] transition-transform hover:-translate-y-1 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-[#1aae39] text-white px-2 py-0.5 text-[11px] font-bold mb-3">
                    🤝 Two-Party Trust
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[#0f5132]">
                    Two-Party Handshake
                  </h3>
                  <p className="mt-2.5 text-sm text-[#0f5132]/90 leading-relaxed font-normal">
                    Approval is not payment. When a debtor records an offline bank or cash transfer, debt remains active until the creditor confirms receipt with one tap. Disputes are surfaced right away.
                  </p>
                </div>
                <div className="mt-4 rounded-xl bg-white/70 p-2.5 text-xs text-[#0f5132] font-semibold border border-[#b8e8c6] flex items-center justify-between">
                  <span>Debtor Logs Claim</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span>Creditor Confirms</span>
                </div>
              </div>

              {/* CARD 3: SKY TINT (Multi-Currency Partitioning) */}
              <div className="rounded-2xl bg-[#dcecfa] border border-[#c0dcf7] p-6 text-[#37352f] transition-transform hover:-translate-y-1 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-[#0075de] text-white px-2 py-0.5 text-[11px] font-bold mb-3">
                    💱 Multi-Currency
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[#0a3663]">
                    Segregated Ledgers
                  </h3>
                  <p className="mt-2.5 text-sm text-[#0a3663]/90 leading-relaxed font-normal">
                    Live in Dubai but split trips in Riyadh? Hisabo partitions SAR, USD, and AED into separate ledgers. Currencies are never blended together into an arbitrary number without live rates.
                  </p>
                </div>
                <div className="mt-4 rounded-xl bg-white/70 p-2.5 text-xs text-[#0a3663] font-semibold border border-[#c0dcf7] flex items-center gap-2">
                  <span className="rounded bg-blue-100 px-1.5 py-0.5">SAR</span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5">USD</span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5">AED</span>
                  <span className="text-[10px] text-slate-500 ml-auto">Independent</span>
                </div>
              </div>

              {/* CARD 4: LAVENDER TINT (Tokenized Expiring Invites) */}
              <div className="rounded-2xl bg-[#e6e0f5] border border-[#d1c7ec] p-6 text-[#37352f] transition-transform hover:-translate-y-1 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-md bg-[#7b3ff2] text-white px-2 py-0.5 text-[11px] font-bold mb-3">
                    🔒 Expiring Invites
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-[#391c57]">
                    Cryptographic Tokens
                  </h3>
                  <p className="mt-2.5 text-sm text-[#391c57]/90 leading-relaxed font-normal">
                    Invite flatmates via secure cryptographic tokens with 24h, 7-day, or 30-day expirations and single-use protections. Revoke anytime to prevent unauthorized link sharing.
                  </p>
                </div>
                <div className="mt-4 rounded-xl bg-white/70 p-2.5 text-xs text-[#391c57] font-semibold border border-[#d1c7ec] flex items-center justify-between">
                  <span>SHA-256 Tokens</span>
                  <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[10px]">7-Day Auto Expiry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: FOOTER, DOWNLOAD LINKS & DEVELOPER LINKS                       */}
      {/* ========================================================================= */}
      <section id="download" className="py-20 bg-white border-b border-[#e5e3df]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Download & PWA Card */}
          <div className="rounded-3xl border border-[#e5e3df] bg-[#f6f5f4] p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="mx-auto max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-3.5 py-1 text-xs font-semibold text-[#185cff] shadow-2xs mb-6">
                <Smartphone className="h-3.5 w-3.5" />
                Installable Progressive Web App (PWA)
              </div>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl text-[#0a1530]">
                Install Hisabo on any phone or desktop.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-base text-[#5d5b54] leading-relaxed">
                Add Hisabo directly to your home screen with zero app store friction. Complete with service worker offline shell caching, instant launch, and Trusted Web Activity (TWA) compliance.
              </p>

              {/* Download & Launch Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md bg-[#185cff] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#1249d6] active:scale-95"
                >
                  <Download className="h-4 w-4" />
                  Install Web App Free
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md border border-[#c8c4be] bg-white px-6 py-3.5 text-sm font-semibold text-[#1a1a1a] transition-all hover:bg-slate-50"
                >
                  Launch Web Dashboard
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>

              {/* Supported Platforms Badges */}
              <div className="mt-8 pt-8 border-t border-[#e5e3df] flex flex-wrap items-center justify-center gap-6 text-xs text-[#787671]">
                <div className="flex items-center gap-1.5 font-medium">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>iOS Safari Home Screen</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>Android Chrome & TWA</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span>macOS & Windows Desktop</span>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* DEVELOPER LINKS & OPEN ARCHITECTURE SECTION                         */}
          {/* ------------------------------------------------------------------- */}
          <div id="developers" className="mt-20">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <div className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#185cff] border border-blue-200 mb-3">
                <Cpu className="h-3.5 w-3.5" />
                Developer Hub & Engineering
              </div>
              <h3 className="text-2xl font-black tracking-tight sm:text-3xl text-[#0a1530]">
                Modern Full-Stack Architecture
              </h3>
              <p className="mt-2 text-sm text-[#787671]">
                Built as a modular monolith adhering to the 2026 React 19 server-first model and audited financial invariants.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tech 1 */}
              <div className="rounded-xl border border-[#e5e3df] bg-[#f6f5f4] p-4 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-[#185cff] mb-1">
                  <Layers className="h-4 w-4" />
                  Next.js 16 & React 19
                </div>
                <p className="text-xs text-[#5d5b54]">
                  Server Components by default, minimal client islands, Turbopack, and type-safe server actions.
                </p>
              </div>

              {/* Tech 2 */}
              <div className="rounded-xl border border-[#e5e3df] bg-[#f6f5f4] p-4 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                  <Database className="h-4 w-4" />
                  Neon PostgreSQL
                </div>
                <p className="text-xs text-[#5d5b54]">
                  Serverless PostgreSQL with connection pooling, strict ACID transactions, and BIGINT minor units.
                </p>
              </div>

              {/* Tech 3 */}
              <div className="rounded-xl border border-[#e5e3df] bg-[#f6f5f4] p-4 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 mb-1">
                  <ShieldCheck className="h-4 w-4" />
                  Drizzle ORM & Zod
                </div>
                <p className="text-xs text-[#5d5b54]">
                  Single source of truth runtime validation, typed migrations, and zero floating-point drift.
                </p>
              </div>

              {/* Tech 4 */}
              <div className="rounded-xl border border-[#e5e3df] bg-[#f6f5f4] p-4 text-left">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
                  <Zap className="h-4 w-4" />
                  Sliding-Window Limiter
                </div>
                <p className="text-xs text-[#5d5b54]">
                  In-memory TTL sliding window rate limiting on authentication and invite join endpoints.
                </p>
              </div>
            </div>

            {/* Quick Developer Action Links */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold">
              <Link
                href="/api/health"
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e3df] bg-white px-3.5 py-2 text-[#37352f] hover:bg-slate-50 transition-colors"
              >
                <Globe className="h-3.5 w-3.5 text-[#185cff]" />
                Endpoint: /api/health
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </Link>
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e3df] bg-white px-3.5 py-2 text-[#37352f] hover:bg-slate-50 transition-colors"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-purple-600" />
                Admin Portal & Currency Controller
              </Link>
              <a
                href="https://github.com/Umar-444/hisabo"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#e5e3df] bg-white px-3.5 py-2 text-[#37352f] hover:bg-slate-50 transition-colors"
              >
                <span>GitHub: Umar-444/hisabo</span>
                <ExternalLink className="h-3 w-3 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* NOTION-STYLE FOOTER                                                       */}
      {/* ========================================================================= */}
      <footer className="bg-white py-14 text-xs text-[#787671]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 pb-12 border-b border-[#e5e3df]">
            {/* Brand Column */}
            <div className="col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#185cff] text-white font-bold text-sm">
                  H
                </div>
                <span className="text-base font-extrabold text-[#0a1530]">Hisabo</span>
              </div>
              <p className="mt-3 text-xs text-[#787671] max-w-sm leading-relaxed">
                Split easy. Settle smart. The auditable shared expense ledger for roommates, flatmates, and group travel.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md w-fit border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
                All Ledger Systems Operational
              </div>
            </div>

            {/* Product Column */}
            <div>
              <div className="font-bold text-[#1a1a1a] uppercase tracking-wider mb-3">Product</div>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-[#185cff] transition-colors">Features</a></li>
                <li><Link href="/dashboard" className="hover:text-[#185cff] transition-colors">Dashboard</Link></li>
                <li><Link href="/groups" className="hover:text-[#185cff] transition-colors">Group Ledgers</Link></li>
                <li><Link href="/balances" className="hover:text-[#185cff] transition-colors">Net Balances</Link></li>
                <li><Link href="/settlements" className="hover:text-[#185cff] transition-colors">Settlements</Link></li>
              </ul>
            </div>

            {/* Engineering & Math Column */}
            <div>
              <div className="font-bold text-[#1a1a1a] uppercase tracking-wider mb-3">Financial Engine</div>
              <ul className="space-y-2">
                <li><a href="#story" className="hover:text-[#185cff] transition-colors">Conservation Equation</a></li>
                <li><a href="#story" className="hover:text-[#185cff] transition-colors">Integer Minor Units</a></li>
                <li><a href="#story" className="hover:text-[#185cff] transition-colors">Two-Party Handshake</a></li>
                <li><a href="#story" className="hover:text-[#185cff] transition-colors">Currency Segregation</a></li>
                <li><Link href="/admin/currencies" className="hover:text-[#185cff] transition-colors">Currency Manager</Link></li>
              </ul>
            </div>

            {/* Developers & Legal */}
            <div>
              <div className="font-bold text-[#1a1a1a] uppercase tracking-wider mb-3">Developers</div>
              <ul className="space-y-2">
                <li><Link href="/api/health" className="hover:text-[#185cff] transition-colors">Health Endpoint</Link></li>
                <li><Link href="/admin" className="hover:text-[#185cff] transition-colors">Admin Portal</Link></li>
                <li><a href="https://github.com/Umar-444/hisabo" target="_blank" rel="noreferrer" className="hover:text-[#185cff] transition-colors">GitHub Repository</a></li>
                <li><Link href="/login" className="hover:text-[#185cff] transition-colors">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-[#185cff] transition-colors">Register</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#787671]">
            <div>© 2026 Hisabo Inc. Split easy. Settle smart. All rights reserved.</div>
            <div className="flex items-center gap-6">
              <span>Next.js 16</span>
              <span>React 19</span>
              <span>Tailwind CSS v4</span>
              <span>Neon PostgreSQL</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
