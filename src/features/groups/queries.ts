import "server-only";
import { db } from "@/app/(backend)/_lib/db";
import { groups, groupMembers, users, expenses, expenseSplits, settlements } from "@/app/(backend)/_lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { GroupDetail, GroupMemberItem } from "./types";

export async function getUserGroupsQuery(userId: string) {
  const memberRows = await db
    .select({
      id: groups.id,
      name: groups.name,
      description: groups.description,
      defaultCurrency: groups.defaultCurrency,
      role: groupMembers.role,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.status, "active")));

  // Fetch count of members and active expenses for each group
  const results = await Promise.all(
    memberRows.map(async (grp) => {
      const [membersCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(groupMembers)
        .where(and(eq(groupMembers.groupId, grp.id), eq(groupMembers.status, "active")));

      const [expensesCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(expenses)
        .where(and(eq(expenses.groupId, grp.id), eq(expenses.status, "active")));

      return {
        ...grp,
        memberCount: membersCount?.count || 1,
        expenseCount: expensesCount?.count || 0,
      };
    })
  );

  return results;
}

export async function getGroupDetailQuery(groupId: string, userId: string): Promise<GroupDetail | null> {
  // Check user is a member of the group
  const [membership] = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId), eq(groupMembers.status, "active")));

  if (!membership) return null;

  const [groupRow] = await db.select().from(groups).where(eq(groups.id, groupId));
  if (!groupRow) return null;

  // Get all active members
  const memberRows = await db
    .select({
      memberId: groupMembers.id,
      userId: users.id,
      name: users.name,
      username: users.username,
      email: users.email,
      role: groupMembers.role,
      status: groupMembers.status,
      joinedAt: groupMembers.joinedAt,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.status, "active")));

  // Calculate net balances for each member in this group
  // 1. Fetch all active expenses for this group
  const groupExpenses = await db
    .select({
      id: expenses.id,
      paidBy: expenses.paidBy,
      amountMinor: expenses.amountMinor,
    })
    .from(expenses)
    .where(and(eq(expenses.groupId, groupId), eq(expenses.status, "active")));

  // 2. Fetch all splits for these expenses
  const expenseIds = groupExpenses.map((e) => e.id);
  let splits: { expenseId: string; userId: string; shareMinor: bigint }[] = [];
  if (expenseIds.length > 0) {
    splits = await db
      .select({
        expenseId: expenseSplits.expenseId,
        userId: expenseSplits.userId,
        shareMinor: expenseSplits.shareMinor,
      })
      .from(expenseSplits)
      .where(sql`${expenseSplits.expenseId} IN ${expenseIds}`);
  }

  // 3. Fetch all confirmed settlements in this group
  const groupSettlements = await db
    .select({
      payerId: settlements.payerId,
      payeeId: settlements.payeeId,
      amountMinor: settlements.amountMinor,
    })
    .from(settlements)
    .where(and(eq(settlements.groupId, groupId), eq(settlements.status, "confirmed")));

  // Map each member's net balance:
  // Net = (Amount paid for expenses - Amount debited for splits) + (Settlements paid - Settlements received)
  const memberBalances: Record<string, bigint> = {};
  for (const m of memberRows) {
    memberBalances[m.userId] = BigInt(0);
  }

  // Add credits for payers of expenses
  for (const exp of groupExpenses) {
    if (memberBalances[exp.paidBy] !== undefined) {
      memberBalances[exp.paidBy] += exp.amountMinor;
    }
  }

  // Subtract debits for participants' shares
  for (const split of splits) {
    if (memberBalances[split.userId] !== undefined) {
      memberBalances[split.userId] -= split.shareMinor;
    }
  }

  // Apply confirmed settlements
  for (const st of groupSettlements) {
    // Payer of settlement gave cash/transfer -> credited towards clearing their debt
    if (memberBalances[st.payerId] !== undefined) {
      memberBalances[st.payerId] += st.amountMinor;
    }
    // Payee of settlement received money -> debited (their credit was paid down)
    if (memberBalances[st.payeeId] !== undefined) {
      memberBalances[st.payeeId] -= st.amountMinor;
    }
  }

  const members: GroupMemberItem[] = memberRows.map((m) => ({
    id: m.memberId,
    userId: m.userId,
    name: m.name ?? "Member",
    username: m.username ?? "user",
    email: m.email,
    role: m.role as "owner" | "admin" | "member",
    status: m.status as "active" | "invited" | "left",
    joinedAt: m.joinedAt,
    netBalanceMinor: memberBalances[m.userId] ?? BigInt(0),
  }));

  const userNetBalanceMinor = memberBalances[userId] ?? BigInt(0);

  return {
    id: groupRow.id,
    name: groupRow.name,
    description: groupRow.description,
    ownerId: groupRow.ownerId,
    defaultCurrency: groupRow.defaultCurrency,
    createdAt: groupRow.createdAt,
    updatedAt: groupRow.updatedAt,
    members,
    currentUserRole: membership.role as "owner" | "admin" | "member",
    userNetBalanceMinor,
    totalExpensesCount: groupExpenses.length,
  };
}
