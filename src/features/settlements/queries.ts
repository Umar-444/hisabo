import "server-only";
import { db } from "@/app/(backend)/_lib/db";
import { settlements, groups, users } from "@/app/(backend)/_lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";
import { isUuid } from "@/lib/utils";

export interface PendingSettlementItem {
  id: string;
  groupId: string;
  groupName: string;
  payerId: string;
  payerName: string;
  payerUsername: string;
  payeeId: string;
  payeeName: string;
  amountMinor: bigint;
  currency: string;
  status: string;
  paymentMethod: string;
  note: string | null;
  createdAt: Date;
}

export async function getUserSettlementsQuery(userId: string) {
  if (!isUuid(userId)) {
    return [];
  }
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

export async function getPendingActionsQuery(userId: string) {
  if (!isUuid(userId)) {
    return {
      pendingToConfirm: [],
      activeDisputes: [],
      totalCount: 0,
    };
  }

  // 1. Pending settlements where this user is the payee (needs to confirm receipt)
  const pendingRows = await db
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
      createdAt: settlements.createdAt,
    })
    .from(settlements)
    .innerJoin(groups, eq(settlements.groupId, groups.id))
    .where(and(eq(settlements.payeeId, userId), eq(settlements.status, "pending")))
    .orderBy(desc(settlements.createdAt));

  // Attach payer names
  const pendingToConfirm: PendingSettlementItem[] = await Promise.all(
    pendingRows.map(async (st) => {
      const [payer] = await db
        .select({ name: users.name, username: users.username })
        .from(users)
        .where(eq(users.id, st.payerId));
      return {
        ...st,
        payerName: payer?.name || "Roommate",
        payerUsername: payer?.username || "user",
        payeeName: "You",
      };
    })
  );

  // 2. Active disputes involving this user
  const disputedRows = await db
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
      createdAt: settlements.createdAt,
    })
    .from(settlements)
    .innerJoin(groups, eq(settlements.groupId, groups.id))
    .where(
      and(
        or(eq(settlements.payeeId, userId), eq(settlements.payerId, userId)),
        eq(settlements.status, "disputed")
      )
    )
    .orderBy(desc(settlements.createdAt));

  const activeDisputes: PendingSettlementItem[] = await Promise.all(
    disputedRows.map(async (st) => {
      const [payer] = await db
        .select({ name: users.name, username: users.username })
        .from(users)
        .where(eq(users.id, st.payerId));
      const [payee] = await db
        .select({ name: users.name, username: users.username })
        .from(users)
        .where(eq(users.id, st.payeeId));
      return {
        ...st,
        payerName: payer?.name || "Roommate",
        payerUsername: payer?.username || "user",
        payeeName: payee?.name || "Roommate",
      };
    })
  );

  return {
    pendingToConfirm,
    activeDisputes,
    totalCount: pendingToConfirm.length + activeDisputes.length,
  };
}
