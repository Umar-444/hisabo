"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { adminLoginAction } from "@/features/admin/actions";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";

export function AdminLoginClient() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, null);
  const [email, setEmail] = useState("admin@hisabo.com");
  const [password, setPassword] = useState("Admin@Hisabo2026!");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f7f6f3] p-4 sm:p-6 text-[#1a1a1a] relative">
      {/* Top back to public site link */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[#787671] hover:text-[#1a1a1a] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hisabo
        </Link>
        <span className="rounded-md bg-[#ede9e4] px-2 py-0.5 text-[11px] font-medium text-[#5d5b54] border border-[#e5e3df]">
          Internal Console
        </span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-[#e5e3df] bg-white p-7 sm:p-8 shadow-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#185CFF] text-white shadow-xs mb-3">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] tracking-tight">
            Hisabo Admin Console
          </h1>
          <p className="text-xs sm:text-sm text-[#787671] mt-1">
            Secured access for moderators, support, and ledger audits
          </p>
        </div>

        {/* Quick Demo Credentials Box (Notion Pastel Callout) */}
        <div className="rounded-xl border border-[#b8dcfa] bg-[#dcecfa]/30 p-3.5 mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#005bab] flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              Demo Credentials
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@hisabo.com");
                setPassword("Admin@Hisabo2026!");
              }}
              className="text-xs text-[#185CFF] hover:underline font-medium cursor-pointer"
            >
              Auto Fill
            </button>
          </div>
          <div className="space-y-0.5 text-xs font-mono text-[#37352f]">
            <div className="flex justify-between">
              <span className="text-[#787671]">Username:</span>
              <span className="font-semibold text-[#1a1a1a]">admin@hisabo.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#787671]">Password:</span>
              <span className="font-semibold text-[#1a1a1a]">Admin@Hisabo2026!</span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {state?.error && (
          <div className="rounded-lg border border-[#f8b4d0] bg-[#fde0ec] p-3 mb-5 text-xs text-[#a02e6d] font-medium flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#e03131] shrink-0" />
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-[#787671] uppercase mb-1.5">
              Admin Email / Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-[#a4a097]" />
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hisabo.com"
                className="w-full rounded-lg border border-[#e5e3df] bg-[#fafaf9] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#1a1a1a] placeholder:text-[#a4a097] focus:border-[#185CFF] focus:bg-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold tracking-wider text-[#787671] uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-[#a4a097]" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-lg border border-[#e5e3df] bg-[#fafaf9] pl-10 pr-11 py-2.5 text-xs sm:text-sm text-[#1a1a1a] placeholder:text-[#a4a097] focus:border-[#185CFF] focus:bg-white focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-[#787671] hover:text-[#1a1a1a] transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-lg bg-[#185CFF] text-white font-medium text-xs sm:text-sm hover:bg-blue-600 transition-all cursor-pointer shadow-xs disabled:opacity-50 mt-1"
          >
            {isPending ? "Authenticating..." : "Sign In to Admin Console"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#ede9e4] text-center text-[11px] text-[#787671]">
          Hisabo Operational Guard &amp; Ledgers · Zero-Loss Integer Math
        </div>
      </div>
    </div>
  );
}
