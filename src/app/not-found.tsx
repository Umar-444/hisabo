import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { ui } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F1F5F9] p-4 text-[#0F172A]">
      <div className="w-full max-w-md rounded-[28px] border border-slate-200/90 bg-white p-8 text-center shadow-xl shadow-slate-200/50 space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#185CFF] font-black text-2xl shadow-inner">
          404
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
            The page or ledger resource you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/dashboard"
            className={ui.btn({
              variant: "primary",
              size: "md",
              className: "font-bold flex items-center justify-center gap-2",
            })}
          >
            <Home className="h-4 w-4" />
            <span>Go to Dashboard</span>
          </Link>

          <Link
            href="/"
            className={ui.btn({
              variant: "secondary",
              size: "md",
              className: "font-bold flex items-center justify-center gap-2",
            })}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Home Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
