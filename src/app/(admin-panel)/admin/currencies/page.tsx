import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import { getAdminCurrenciesQuery } from "@/features/admin/queries";
import { CurrencyManagerClient } from "./currency-manager-client";

export const dynamic = "force-dynamic";

export default async function AdminCurrenciesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const currencyList = await getAdminCurrenciesQuery();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e3df]">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-[#ffe8d4] text-[#793400] flex items-center justify-center shrink-0 border border-[#fed0ab]">
            <span className="text-lg">💰</span>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1a1a1a] tracking-tight">
              Currencies &amp; Settlement Controls
            </h1>
            <p className="text-xs sm:text-sm text-[#787671] mt-0.5">
              Configure which currencies are live for user expense splitting and set platform default.
            </p>
          </div>
        </div>
      </div>

      <CurrencyManagerClient initialCurrencies={currencyList} />
    </div>
  );
}
