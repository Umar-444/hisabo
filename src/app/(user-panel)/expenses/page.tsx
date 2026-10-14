import { getUserSession } from "@/lib/auth/user-session";
import { redirect } from "next/navigation";
import { getUserGroupsQuery } from "@/features/groups";
import { db } from "@/app/(backend)/_lib/db";
import { expenses, users, groups } from "@/app/(backend)/_lib/db/schema";
import { desc, inArray, eq } from "drizzle-orm";
import {
  ExpensesFeedClient,
  SerializedExpenseRow,
} from "@/features/expenses/components/expenses-feed-client";

export const metadata = {
  title: "Expenses Feed — Hisabo",
};

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const session = await getUserSession();
  if (!session) {
    return null;
  }

  const userGroups = await getUserGroupsQuery(session.id);
  const groupIds = userGroups.map((g) => g.id);

  let rawExpenses: any[] = [];
  if (groupIds.length > 0) {
    rawExpenses = await db
      .select({
        id: expenses.id,
        description: expenses.description,
        amountMinor: expenses.amountMinor,
        currency: expenses.currency,
        category: expenses.category,
        status: expenses.status,
        createdAt: expenses.createdAt,
        paidBy: expenses.paidBy,
        payerName: users.name,
        groupId: expenses.groupId,
        groupName: groups.name,
      })
      .from(expenses)
      .innerJoin(users, eq(expenses.paidBy, users.id))
      .innerJoin(groups, eq(expenses.groupId, groups.id))
      .where(inArray(expenses.groupId, groupIds))
      .orderBy(desc(expenses.createdAt));
  }

  const serializedExpenses: SerializedExpenseRow[] = rawExpenses.map((e) => ({
    id: e.id,
    description: e.description,
    amountMinor: e.amountMinor.toString(),
    currency: e.currency,
    category: e.category,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
    paidBy: e.paidBy,
    payerName: e.payerName,
    groupId: e.groupId,
    groupName: e.groupName,
  }));

  const groupsList = userGroups.map((g) => ({ id: g.id, name: g.name }));

  return (
    <ExpensesFeedClient
      expenses={serializedExpenses}
      currentUserId={session.id}
      groupsList={groupsList}
    />
  );
}
