import Link from "next/link";
import { ui } from "@/lib/ui";
import {
  ArrowRight,
  CheckCircle2,
  Receipt,
  Users,
  ShieldCheck,
  Smartphone,
  PieChart,
  DollarSign,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F1F5F9] text-[#0F172A]">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#185CFF] text-white shadow-md shadow-[#185CFF]/25">
              <span className="text-xl font-bold tracking-tight">H</span>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-[#0F172A]">
                Hisabo
              </span>
              <span className="hidden text-xs font-semibold text-[#185CFF] sm:inline-block sm:ml-2 rounded-full bg-blue-50 px-2 py-0.5 border border-blue-200">
                PWA Ready
              </span>
            </div>
          </div>

          <nav className="hidden items-center gap-8 md:flex text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-[#185CFF] transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-[#185CFF] transition-colors">
              How It Works
            </Link>
            <Link href="#security" className="hover:text-[#185CFF] transition-colors">
              Security
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={ui.btn({ variant: "ghost", size: "sm" })}
            >
              Log In
            </Link>
            <Link
              href="/register"
              className={ui.btn({ variant: "primary", size: "sm" })}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-[#185CFF] mb-8 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5" />
              Shared expenses without the awkward conversations
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight sm:text-6xl text-[#0F172A] leading-tight">
              Split easy. <br className="hidden sm:inline" />
              <span className="text-[#185CFF]">Settle smart.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 leading-relaxed">
              Track who paid, split bills fairly with integer-precise math, and settle up with your roommates, friends, or travel partners—all in one auditable ledger.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className={ui.btn({ variant: "primary", size: "lg", className: "w-full sm:w-auto" })}
              >
                Start Splitting Free
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
              <Link
                href="#how-it-works"
                className={ui.btn({ variant: "outline", size: "lg", className: "w-full sm:w-auto" })}
              >
                See How It Works
              </Link>
            </div>

            {/* Live Interactive Ledger Demonstration Card */}
            <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#185CFF]">
                    Sample Shared Dinner
                  </div>
                  <div className="text-xl font-bold text-[#0F172A] mt-0.5">
                    Dinner with friends
                  </div>
                  <div className="text-sm text-slate-500">
                    Paid by Umar · 4 participants (Equal split)
                  </div>
                </div>
                <div className="sm:text-right">
                  <div className="text-xs text-slate-400 font-medium">Total Bill</div>
                  <div className="text-2xl font-black text-[#0F172A]">SAR 160.00</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500">Each Person&apos;s Share</div>
                  <div className="text-xl font-extrabold text-[#0F172A] mt-1">SAR 40.00</div>
                  <div className="text-xs text-slate-400 mt-1">100% Zero-Loss Integer Math</div>
                </div>
                <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-100">
                  <div className="text-xs font-semibold text-emerald-800">Net Owed to Umar</div>
                  <div className="text-xl font-extrabold text-[#10B981] mt-1">+ SAR 120.00</div>
                  <div className="text-xs text-emerald-600 mt-1">SAR 40.00 from Ali, Ahmed & Bilal</div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 text-xs text-slate-600 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#10B981] shrink-0" />
                <span>
                  <strong>Zero-Sum Invariant Checked:</strong> Sum of debtor balances (-120) and creditor balance (+120) equals exactly zero.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 5 Core Questions Answered */}
        <section id="features" className="py-20 bg-white border-y border-slate-200/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#185CFF]">
                Core Product Philosophy
              </h2>
              <p className="mt-2 text-3xl font-black text-[#0F172A] sm:text-4xl">
                Always Know Where You Stand
              </p>
              <p className="mt-4 text-slate-600">
                At any given second, Hisabo gives unambiguous clarity on five fundamental questions:
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={ui.card}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#185CFF] mb-5 border border-blue-100">
                  <Receipt className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">1. Who Paid?</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Record exact payer attribution, receipt attachments, and timestamped transaction headers.
                </p>
              </div>

              <div className={ui.card}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#10B981] mb-5 border border-emerald-100">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">2. Who Participated?</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Assign equal shares or custom weights. Extra halalas are allocated deterministically with zero loss.
                </p>
              </div>

              <div className={ui.card}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mb-5 border border-purple-100">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">3. How Much Owed?</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Real-time net balance calculations dynamically computed from approved ledger records.
                </p>
              </div>

              <div className={ui.card}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-[#F59E0B] mb-5 border border-amber-100">
                  <PieChart className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">4. What Is Disputed?</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Independent lifecycles for expense approval (`pending`, `accepted`, `disputed`) before settling.
                </p>
              </div>

              <div className={ui.card}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#10B981] mb-5 border border-emerald-100">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">5. Who Settled Up?</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Off-platform payments require explicit creditor confirmation before debt is marked as cleared.
                </p>
              </div>

              <div className={ui.card}>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#185CFF] mb-5 border border-blue-100">
                  <Smartphone className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0F172A]">PWA & Mobile Ready</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Installable Progressive Web App with offline fallback shell and Trusted Web Activity support for Android.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#0F172A] px-6 py-16 sm:px-16 text-center text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-3xl font-black sm:text-4xl tracking-tight">
                  Ready to eliminate awkward money chats?
                </h2>
                <p className="mt-4 text-slate-300 text-base">
                  Join roommates, flats, and friends keeping honest, transparent financial ledgers on Hisabo.
                </p>
                <div className="mt-8 flex justify-center">
                  <Link
                    href="/register"
                    className={ui.btn({ variant: "primary", size: "lg" })}
                  >
                    Create Your First Group
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0F172A]">Hisabo</span>
            <span>— Split easy. Settle smart.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-slate-900 transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
