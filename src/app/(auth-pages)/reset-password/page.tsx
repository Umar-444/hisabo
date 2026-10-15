"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, ShieldCheck, KeyRound } from "lucide-react";
import { ui } from "@/lib/ui";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F1F5F9] p-4 sm:p-6 text-[#0F172A]">
      <div className="w-full max-w-md mb-6 flex justify-between items-center text-xs">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#185CFF] font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>

      <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/60">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#185CFF] mb-3 border border-blue-100">
            <KeyRound className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enter your registered email to request recovery instructions
          </p>
        </div>

        {isSubmitted ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center space-y-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-900">Request Received</h3>
              <p className="text-xs text-emerald-800/80 mt-1 leading-relaxed">
                If an account exists for <strong className="font-semibold text-emerald-950">{email}</strong>, our team has logged your password recovery request.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full h-10 rounded-xl bg-[#185CFF] text-white text-xs font-bold hover:bg-[#1249D6] transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={ui.label}>Registered Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${ui.input} pl-10`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-11 rounded-xl bg-[#185CFF] hover:bg-[#1249D6] text-white text-sm font-bold shadow-md shadow-[#185CFF]/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              Send Reset Instructions
            </button>

            <div className="pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Remember your password?{" "}
                <Link href="/login" className="font-bold text-[#185CFF] hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
