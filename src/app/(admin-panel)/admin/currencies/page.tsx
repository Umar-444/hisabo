import { getAdminSession } from "@/lib/auth/admin-session";
import { redirect } from "next/navigation";
import { getAdminCurrenciesQuery } from "@/features/admin/queries";
import { CurrencyManagerClient } from "./currency-manager-client";

export const instant = false;

export default async function AdminCurrenciesPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  const currencyList = await getAdminCurrenciesQuery();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Currencies &amp; Settlement Controls
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure which currencies are live for user expense splitting and set platform default.
        </p>
      </div>

      <CurrencyManagerClient initialCurrencies={currencyList} />
    </div>
  );
}
