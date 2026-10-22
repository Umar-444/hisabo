"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ui } from "@/lib/ui";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function UserPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("User panel error caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-[#EF4444] border border-red-200">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-[#0a1530] tracking-tight">
        Something went wrong
      </h2>
      <p className="mt-1.5 max-w-md text-xs text-[#787671] leading-relaxed">
        We encountered an unexpected issue while loading your ledger data. Please try refreshing or return to the dashboard.
      </p>

      {error?.message && process.env.NODE_ENV !== "production" && (
        <div className="mt-3 max-w-lg rounded-lg border border-red-200 bg-red-50/50 p-2.5 text-left text-xs font-mono text-red-800 break-all">
          {error.message}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => reset()}
          className={ui.btn({ variant: "primary", size: "sm" })}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Try again</span>
        </button>
        <Link
          href="/dashboard"
          className={ui.btn({ variant: "outline", size: "sm" })}
        >
          <Home className="h-3.5 w-3.5 text-[#185CFF]" />
          <span>Reload Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
