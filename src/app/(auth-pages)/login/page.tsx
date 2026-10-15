"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/features/auth/actions";
import { ui } from "@/lib/ui";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Sparkles, AlertCircle, X, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [email, setEmail] = useState("umar@hisabo.com");
  const [password, setPassword] = useState("Admin@Hisabo2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F1F5F9] p-4 sm:p-6 text-[#0F172A] relative">
      {/* Top back link */}
      <div className="w-full max-w-md mb-6 flex justify-between items-center text-xs">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#185CFF] font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hisabo
        </Link>
        <Link
          href="/admin/login"
          className="text-slate-400 hover:text-slate-700 transition-colors"
        >
          Admin Console →
        </Link>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#185CFF] text-white shadow-md shadow-[#185CFF]/25 mb-3 font-bold text-xl">
            H
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Welcome back
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to track your group expenses and balances
          </p>
        </div>

        {/* Demo Fast Login Box */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5 mb-6 text-xs text-blue-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#185CFF] shrink-0" />
            <div>
              <span className="font-bold">Test Account: </span>
              <span className="font-mono text-slate-700">umar@hisabo.com</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setEmail("umar@hisabo.com");
              setPassword("Admin@Hisabo2026!");
              setDismissedError(true);
            }}
            className="text-[11px] font-bold text-[#185CFF] hover:underline cursor-pointer"
          >
            Fill Demo
          </button>
        </div>

        {/* Error notification */}
        {state?.error && !dismissedError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 mb-5 text-xs text-red-700 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            {state.error}
          </div>
        )}

        <form
          action={(payload) => {
            setDismissedError(false);
            formAction(payload);
          }}
          className="space-y-4"
        >
          <div>
            <label className={ui.label}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setDismissedError(true);
                }}
                placeholder="you@example.com"
                className={`${ui.input} pl-10 ${
                  state?.fieldErrors?.email && !dismissedError
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : ""
                }`}
              />
            </div>
            {state?.fieldErrors?.email && !dismissedError && (
              <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <span>{state.fieldErrors.email}</span>
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className={ui.label + " mb-0"}>Password</label>
              <Link
                href="/reset-password"
                className="text-xs text-[#185CFF] hover:underline cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setDismissedError(true);
                }}
                placeholder="••••••••••••"
                className={`${ui.input} pl-10 pr-10 ${
                  state?.fieldErrors?.password
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {state?.fieldErrors?.password && (
              <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <span>{state.fieldErrors.password}</span>
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className={ui.btn({
              variant: "primary",
              size: "md",
              className: "w-full font-bold mt-2",
            })}
          >
            {isPending ? "Signing in..." : "Log In"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          Don&apos;t have an account yet?{" "}
          <Link
            href="/register"
            className="font-bold text-[#185CFF] hover:underline"
          >
            Create free account
          </Link>
        </div>
      </div>

      {/* Password Recovery Help Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-[24px] border border-slate-200 bg-white p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 relative">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#185CFF] flex items-center justify-center shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Password Recovery</h3>
                <p className="text-[11px] text-slate-400">Hisabo Account Security</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 text-xs text-slate-600 leading-relaxed space-y-2">
              <p>
                In the current version, passwords cannot be reset automatically without email confirmation tokens.
              </p>
              <p>
                If you forgot your password, please email our support team at{" "}
                <a
                  href="mailto:support@hisabo.com?subject=Password%20Reset%20Request"
                  className="font-bold text-[#185CFF] hover:underline"
                >
                  support@hisabo.com
                </a>{" "}
                or ask a flatmate/admin in your shared group to verify your identity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className={ui.btn({
                variant: "primary",
                size: "md",
                className: "w-full font-bold",
              })}
            >
              Got it, thanks
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
