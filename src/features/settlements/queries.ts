import "server-only";
import { db } from "@/app/(backend)/_lib/db";
import { settlements, groups, users, paymentRequests, groupMembers, expenses, expenseSplits } from "@/app/(backend)/_lib/db/schema";
import { eq, or, and, desc, gte, sql } from "drizzle-orm";
import { isUuid } from "@/lib/utils";
import { createInternalNotification } from "@/features/notifications";

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
      rejectionReason: settlements.rejectionReason,
      rejectionNote: settlements.rejectionNote,
      decidedAt: settlements.decidedAt,
      decidedBy: settlements.decidedBy,
      escalatedToAdminAt: settlements.escalatedToAdminAt,
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

/**
 * Calculates how much debtorId owes creditorId in a specific group in minor units (halalas/cents)
 */
export async function getPairwiseDebtMinor(
  debtorId: string,
  creditorId: string,
  groupId: string
): Promise<bigint> {
  if (!isUuid(debtorId) || !isUuid(creditorId) || !isUuid(groupId)) {
    return BigInt(0);
  }

  // 1. Fetch active expenses in this group
  const groupExpenses = await db
    .select({
      id: expenses.id,
      paidBy: expenses.paidBy,
    })
    .from(expenses)
    .where(and(eq(expenses.groupId, groupId), eq(expenses.status, "active")));

  if (groupExpenses.length === 0) return BigInt(0);
  const expenseIds = groupExpenses.map((e) => e.id);

  // 2. Fetch splits
  const splits = await db
    .select({
      expenseId: expenseSplits.expenseId,
      userId: expenseSplits.userId,
      shareMinor: expenseSplits.shareMinor,
    })
    .from(expenseSplits)
    .where(sql`${expenseSplits.expenseId} IN ${expenseIds}`);

  const splitsByExp: Record<string, { userId: string; shareMinor: bigint }[]> = {};
  for (const s of splits) {
    if (!splitsByExp[s.expenseId]) splitsByExp[s.expenseId] = [];
    splitsByExp[s.expenseId].push(s);
  }

  let debtMinor = BigInt(0);

  // If creditor paid, debtor owes their split share
  for (const exp of groupExpenses) {
    const expSplits = splitsByExp[exp.id] || [];
    if (exp.paidBy === creditorId) {
      const debtorSplit = expSplits.find((s) => s.userId === debtorId);
      if (debtorSplit) {
        debtMinor += debtorSplit.shareMinor;
      }
    } else if (exp.paidBy === debtorId) {
      const creditorSplit = expSplits.find((s) => s.userId === creditorId);
      if (creditorSplit) {
        debtMinor -= creditorSplit.shareMinor;
      }
    }
  }

  // 3. Apply confirmed settlements between this pair in this group
  const pairSettlements = await db
    .select({
      payerId: settlements.payerId,
      payeeId: settlements.payeeId,
      amountMinor: settlements.amountMinor,
    })
    .from(settlements)
    .where(
      and(
        eq(settlements.groupId, groupId),
        eq(settlements.status, "confirmed"),
        or(
          and(eq(settlements.payerId, debtorId), eq(settlements.payeeId, creditorId)),
          and(eq(settlements.payerId, creditorId), eq(settlements.payeeId, debtorId))
        )
      )
    );

  for (const st of pairSettlements) {
    if (st.payerId === debtorId && st.payeeId === creditorId) {
      debtMinor -= st.amountMinor;
    } else if (st.payerId === creditorId && st.payeeId === debtorId) {
      debtMinor += st.amountMinor;
    }
  }

  return debtMinor > BigInt(0) ? debtMinor : BigInt(0);
}

/**
 * Returns map of `${groupId}:${debtorId}` -> Date of last request sent by creditor in the last 24h
 */
export async function getActivePaymentRequestsMapQuery(creditorId: string): Promise<Record<string, Date>> {
  if (!isUuid(creditorId)) return {};

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const rows = await db
    .select({
      groupId: paymentRequests.groupId,
      debtorId: paymentRequests.debtorId,
      requestedAt: paymentRequests.requestedAt,
    })
    .from(paymentRequests)
    .where(
      and(
        eq(paymentRequests.creditorId, creditorId),
        gte(paymentRequests.requestedAt, cutoff)
      )
    )
    .orderBy(desc(paymentRequests.requestedAt));

  const map: Record<string, Date> = {};
  for (const r of rows) {
    const key = `${r.groupId}:${r.debtorId}`;
    if (!map[key]) {
      map[key] = r.requestedAt;
    }
  }
  return map;
}

/**
 * Checks for pending settlements created > 72 hours ago and escalates them to group admins/owners
 */
export async function checkAndEscalatePendingSettlementsQuery(): Promise<number> {
  const cutoff72h = new Date(Date.now() - 72 * 60 * 60 * 1000);

  const staleSettlements = await db
    .select({
      id: settlements.id,
      groupId: settlements.groupId,
      payerId: settlements.payerId,
      payeeId: settlements.payeeId,
      amountMinor: settlements.amountMinor,
      currency: settlements.currency,
      createdAt: settlements.createdAt,
    })
    .from(settlements)
    .where(
      and(
        eq(settlements.status, "pending"),
        sql`${settlements.createdAt} <= ${cutoff72h}`,
        sql`${settlements.escalatedToAdminAt} IS NULL`
      )
    )
    .limit(20);

  let escalatedCount = 0;

  for (const st of staleSettlements) {
    // 1. Mark escalated
    await db
      .update(settlements)
      .set({ escalatedToAdminAt: new Date() })
      .where(eq(settlements.id, st.id));

    // 2. Fetch payer & payee names
    const [payer] = await db.select({ name: users.name }).from(users).where(eq(users.id, st.payerId));
    const [payee] = await db.select({ name: users.name }).from(users).where(eq(users.id, st.payeeId));
    const [grp] = await db.select({ ownerId: groups.ownerId }).from(groups).where(eq(groups.id, st.groupId));

    // 3. Find group admins
    const adminRows = await db
      .select({ userId: groupMembers.userId })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, st.groupId),
          or(eq(groupMembers.role, "admin"), eq(groupMembers.role, "owner"))
        )
      );

    const adminUserIds = new Set<string>();
    if (grp?.ownerId) adminUserIds.add(grp.ownerId);
    for (const a of adminRows) adminUserIds.add(a.userId);

    const amountFormatted = `${st.currency} ${(Number(st.amountMinor) / 100).toFixed(2)}`;
    const debtorName = payer?.name || "Debtor";
    const creditorName = payee?.name || "Creditor";

    // Exact copy (§7): "A {amount} claim from {debtor} to {creditor} has waited 3 days and needs your decision."
    for (const adminId of adminUserIds) {
      await createInternalNotification(
        adminId,
        "settlement_escalated",
        "Settlement Escalated to Admin",
        `A ${amountFormatted} claim from ${debtorName} to ${creditorName} has waited 3 days and needs your decision.`,
        `/settlements`
      );
    }

    escalatedCount++;
  }

  return escalatedCount;
}

