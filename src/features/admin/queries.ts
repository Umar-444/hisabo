import "server-only";
import { db } from "@/app/(backend)/_lib/db";
import { currencies } from "@/app/(backend)/_lib/db/schema";
import { desc, asc, eq } from "drizzle-orm";

export async function getAdminCurrenciesQuery() {
  const rows = await db
    .select()
    .from(currencies)
    .orderBy(desc(currencies.isDefault), desc(currencies.isLive), asc(currencies.code));

  return rows;
}

export async function getLiveCurrenciesQuery() {
  const rows = await db
    .select()
    .from(currencies)
    .where(eq(currencies.isLive, true))
    .orderBy(desc(currencies.isDefault), asc(currencies.code));

  return rows;
}
