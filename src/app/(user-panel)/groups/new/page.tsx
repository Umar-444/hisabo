import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { NewGroupFormClient } from "@/features/groups/components/new-group-form";
import { getLiveCurrenciesQuery } from "@/features/admin/queries";

export const instant = false;

export default async function NewGroupPage() {
  const session = await getUserSession();
  if (!session) {
    redirect("/login");
  }

  let liveCurrencies: Array<{
    code: string;
    name: string;
    symbol: string;
    isDefault: boolean;
  }> = [];

  try {
    const rawCurrencies = await getLiveCurrenciesQuery();
    liveCurrencies = rawCurrencies.map((c) => ({
      code: c.code,
      name: c.name,
      symbol: c.symbol,
      isDefault: c.isDefault,
    }));
  } catch (err) {
    console.error("Failed to fetch live currencies:", err);
  }

  return (
    <div className="mx-auto max-w-lg pb-24">
      <NewGroupFormClient currencies={liveCurrencies} />
    </div>
  );
}
