"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { loginAction } from "@/features/auth/actions";
import { ui } from "@/lib/ui";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        <span className="text-slate-400">Secure Sign In</span>
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
    </div>
  );
}
