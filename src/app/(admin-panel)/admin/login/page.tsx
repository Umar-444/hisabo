"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { adminLoginAction } from "@/features/admin/actions";
import { ui } from "@/lib/ui";
import { ShieldCheck, Lock, Mail, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLoginAction, null);
  const [email, setEmail] = useState("admin@hisabo.com");
  const [password, setPassword] = useState("Admin@Hisabo2026!");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#0F172A] p-4 sm:p-6 text-slate-100 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#185CFF]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top back to public site link */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hisabo
        </Link>
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-slate-400 border border-slate-700/80">
          Internal Console
        </span>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#185CFF] text-white shadow-lg shadow-[#185CFF]/30 mb-4">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Hisabo Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            Secured access for moderators, support, and ledger audits
          </p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="rounded-2xl border border-blue-500/30 bg-blue-950/40 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5" />
              Admin Credentials
            </span>
            <button
              type="button"
              onClick={() => {
                setEmail("admin@hisabo.com");
                setPassword("Admin@Hisabo2026!");
              }}
              className="text-xs text-blue-300 hover:text-white font-medium underline underline-offset-2 cursor-pointer"
            >
              Auto Fill
            </button>
          </div>
          <div className="space-y-1 text-xs font-mono text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Username:</span>
              <span className="font-semibold text-white">admin@hisabo.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Password:</span>
              <span className="font-semibold text-white">Admin@Hisabo2026!</span>
            </div>
          </div>
        </div>

        {/* Error notification */}
        {state?.error && (
          <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-3.5 mb-6 text-xs text-red-300 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold tracking-wide text-slate-300 uppercase mb-2">
              Admin Email / Username
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@hisabo.com"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#185CFF] focus:outline-none focus:ring-2 focus:ring-[#185CFF]/30 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-wide text-slate-300 uppercase mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-slate-700 bg-slate-800/80 pl-10 pr-11 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-[#185CFF] focus:outline-none focus:ring-2 focus:ring-[#185CFF]/30 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={ui.btn({
              variant: "primary",
              size: "md",
              className: "w-full mt-2 font-bold",
            })}
          >
            {isPending ? "Authenticating..." : "Sign In to Admin Console"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          Hisabo Operational Guard & Ledgers · Zero-Loss Integer Math
        </div>
      </div>
    </div>
  );
}
