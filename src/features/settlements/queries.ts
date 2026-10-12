import "server-only";
import { db } from "@/app/(backend)/_lib/db";
import { settlements, groups, users } from "@/app/(backend)/_lib/db/schema";
import { eq, or, desc } from "drizzle-orm";

export async function getUserSettlementsQuery(userId: string) {
  const rows = await db
    .select({
      id: settlements.id,
      groupId: settlements.groupId,
      groupName: groups.name,
      payerId: settlements.payerId,
      payeeId: settlements.payeeId,
      amountMinor: settlements.amountMinor,
      currency: settlements.currency,
      status: settlements.status,
      paymentMethod: settlements.paymentMethod,
      note: settlements.note,
      settledAt: settlements.settledAt,
      createdAt: settlements.createdAt,
    })
    .from(settlements)
    .innerJoin(groups, eq(settlements.groupId, groups.id))
    .where(or(eq(settlements.payerId, userId), eq(settlements.payeeId, userId)))
    .orderBy(desc(settlements.createdAt));

  // Attach user names
  const results = await Promise.all(
    rows.map(async (st) => {
      const [payer] = await db.select({ name: users.name, username: users.username }).from(users).where(eq(users.id, st.payerId));
      const [payee] = await db.select({ name: users.name, username: users.username }).from(users).where(eq(users.id, st.payeeId));

      return {
        ...st,
        payerName: payer?.name || "Unknown",
        payerUsername: payer?.username || "",
        payeeName: payee?.name || "Unknown",
        payeeUsername: payee?.username || "",
        isUserPayer: st.payerId === userId,
        isUserPayee: st.payeeId === userId,
      };
    })
  );

  return results;
}
