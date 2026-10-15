"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registerAction } from "@/features/auth/actions";
import { ui } from "@/lib/ui";
import { User, Mail, Lock, AtSign, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(registerAction, null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

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
        <span className="text-slate-400">100% Free · No bank account needed</span>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#185CFF] text-white shadow-md shadow-[#185CFF]/25 mb-3 font-bold text-xl">
            H
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Create your account
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Start tracking flat expenses, dinners, and balances in seconds
          </p>
        </div>

        {/* General error notification if no specific field error matches */}
        {state?.error && !state?.fieldErrors && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 mb-5 text-xs text-red-700 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 shrink-0" />
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          <div>
            <label className={ui.label}>Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange("name")}
                placeholder="e.g. Umar Farooq"
                className={`${ui.input} pl-10 ${
                  state?.fieldErrors?.name
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : ""
                }`}
              />
            </div>
            {state?.fieldErrors?.name && (
              <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <span>{state.fieldErrors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label className={ui.label}>Username (for friends to find you)</label>
            <div className="relative">
              <AtSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange("username")}
                placeholder="e.g. umar"
                className={`${ui.input} pl-10 ${
                  state?.fieldErrors?.username
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : ""
                }`}
              />
            </div>
            {state?.fieldErrors?.username && (
              <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <span>{state.fieldErrors.username}</span>
              </p>
            )}
          </div>

          <div>
            <label className={ui.label}>Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange("email")}
                placeholder="you@example.com"
                className={`${ui.input} pl-10 ${
                  state?.fieldErrors?.email
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : ""
                }`}
              />
            </div>
            {state?.fieldErrors?.email && (
              <div className="mt-1.5 flex flex-col gap-0.5">
                <p className="text-[11px] text-red-600 flex items-center gap-1.5 font-medium">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                  <span>{state.fieldErrors.email}</span>
                </p>
                {state.fieldErrors.email.includes("already exists") && (
                  <Link
                    href="/login"
                    className="text-[11px] font-bold text-[#185CFF] hover:underline pl-5"
                  >
                    Click here to log into this account →
                  </Link>
                )}
              </div>
            )}
          </div>

          <div>
            <label className={ui.label}>Password (minimum 6 characters)</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange("password")}
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

          <div>
            <label className={ui.label}>Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="••••••••••••"
                className={`${ui.input} pl-10 ${
                  state?.fieldErrors?.confirmPassword ||
                  (formData.confirmPassword && formData.password !== formData.confirmPassword)
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50/20"
                    : ""
                }`}
              />
            </div>
            {(state?.fieldErrors?.confirmPassword ||
              (formData.confirmPassword && formData.password !== formData.confirmPassword)) && (
              <p className="text-[11px] text-red-600 mt-1.5 flex items-center gap-1.5 font-medium">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                <span>
                  {state?.fieldErrors?.confirmPassword || "Passwords do not match"}
                </span>
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
            {isPending ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-bold text-[#185CFF] hover:underline"
          >
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
