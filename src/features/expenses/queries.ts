import "server-only";
import { db } from "@/app/(backend)/_lib/db";
import { expenses, expenseSplits, groups, users } from "@/app/(backend)/_lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ExpenseDetail } from "./types";

export async function getGroupExpensesQuery(groupId: string) {
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

  return rows;
}

export async function getExpenseDetailQuery(expenseId: string, currentUserId: string): Promise<ExpenseDetail | null> {
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
