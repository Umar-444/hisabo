import "server-only";
import { db } from "@/app/(backend)/_lib/db";
import { expenses, expenseSplits, groups, users, groupMembers } from "@/app/(backend)/_lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { isUuid } from "@/lib/utils";
import { ExpenseDetail } from "./types";

export async function getGroupExpensesQuery(groupId: string, userId?: string) {
  if (!isUuid(groupId)) {
    return [];
  }

  let membership: { role: string; joinedAt: Date | null } | null = null;
  if (userId && isUuid(userId)) {
    const [m] = await db
      .select({ role: groupMembers.role, joinedAt: groupMembers.joinedAt })
      .from(groupMembers)
      .where(
        and(
          eq(groupMembers.groupId, groupId),
          eq(groupMembers.userId, userId),
          eq(groupMembers.status, "active")
        )
      );
    membership = m ?? null;
  }

  const rows = await db
    .select({
      id: expenses.id,
      groupId: expenses.groupId,
      description: expenses.description,
      amountMinor: expenses.amountMinor,
      currency: expenses.currency,
      category: expenses.category,
      status: expenses.status,
      paidById: expenses.paidBy,
      paidByName: users.name,
      createdAt: expenses.createdAt,
    })
    .from(expenses)
    .innerJoin(users, eq(expenses.paidBy, users.id))
    .where(and(eq(expenses.groupId, groupId), eq(expenses.status, "active")))
    .orderBy(desc(expenses.createdAt));

  // If regular member, scope to expenses created on or after joinedAt (or where they are payer)
  if (membership && membership.role === "member" && membership.joinedAt) {
    return rows.filter((r) => r.paidById === userId || r.createdAt >= membership!.joinedAt!);
  }

  return rows;
}

export async function getExpenseDetailQuery(expenseId: string, currentUserId: string): Promise<ExpenseDetail | null> {
  if (!isUuid(expenseId) || !isUuid(currentUserId)) {
    return null;
  }
  const [row] = await db
    .select({
      id: expenses.id,
      groupId: expenses.groupId,
      groupName: groups.name,
      description: expenses.description,
      amountMinor: expenses.amountMinor,
      currency: expenses.currency,
      category: expenses.category,
      paidById: expenses.paidBy,
      paidByName: users.name,
      paidByUsername: users.username,
      createdById: expenses.createdBy,
      receiptUrl: expenses.receiptUrl,
      status: expenses.status,
      createdAt: expenses.createdAt,
    })
    .from(expenses)
    .innerJoin(groups, eq(expenses.groupId, groups.id))
    .innerJoin(users, eq(expenses.paidBy, users.id))
    .where(eq(expenses.id, expenseId));

  if (!row) return null;

  // Authorization check: currentUserId must be an active member of this group
  const [membership] = await db
    .select({ role: groupMembers.role, joinedAt: groupMembers.joinedAt })
    .from(groupMembers)
    .where(
      and(
        eq(groupMembers.groupId, row.groupId),
        eq(groupMembers.userId, currentUserId),
        eq(groupMembers.status, "active")
      )
    );

  if (!membership) {
    return null; // Not an active member of this group
  }

  // Fetch splits with user info
  const splitRows = await db
    .select({
      id: expenseSplits.id,
      userId: expenseSplits.userId,
      userName: users.name,
      userUsername: users.username,
      shareMinor: expenseSplits.shareMinor,
      decisionStatus: expenseSplits.decisionStatus,
    })
    .from(expenseSplits)
    .innerJoin(users, eq(expenseSplits.userId, users.id))
    .where(eq(expenseSplits.expenseId, expenseId));

  const userSplit = splitRows.find((s) => s.userId === currentUserId);
  const isUserPayer = row.paidById === currentUserId;
  const isParticipant = !!userSplit;
  const isPrivileged = membership.role === "owner" || membership.role === "admin";

  // Pre-join privacy check for regular members who did not participate or pay
  if (
    !isPrivileged &&
    !isUserPayer &&
    !isParticipant &&
    membership.joinedAt &&
    row.createdAt < membership.joinedAt
  ) {
    return null; // Scoped out: pre-join expense for non-participating member
  }

  return {
    ...row,
    paidByName: row.paidByName ?? "Member",
    paidByUsername: row.paidByUsername ?? "user",
    status: row.status as "active" | "cancelled" | "disputed",
    splits: splitRows.map((s) => ({
      ...s,
      userName: s.userName ?? "Member",
      userUsername: s.userUsername ?? "user",
      decisionStatus: s.decisionStatus as "pending" | "accepted" | "disputed",
    })),
    userShareMinor: userSplit?.shareMinor ?? null,
    isUserPayer: row.paidById === currentUserId,
  };
}
