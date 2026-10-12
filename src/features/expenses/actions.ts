"use server";

import { db } from "@/app/(backend)/_lib/db";
import { expenses, expenseSplits, expenseEvents, outboxEvents, groupMembers } from "@/app/(backend)/_lib/db/schema";
import { getUserSession } from "@/lib/auth/user-session";
import { createExpenseSchema, CreateExpenseInput, disputeExpenseSchema } from "./schema";
import { calculateEqualSplits, toMinorUnits, validateCustomSplits, SplitResult } from "@/lib/money";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

export async function createExpenseAction(input: CreateExpenseInput) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const parsed = createExpenseSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid expense input" };
  }

  const { groupId, description, amount, currency, category, paidBy, splitType, participants, customSplits } = parsed.data;

  // 1. Verify caller and participants are members of the group
  const groupMembership = await db
    .select()
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.id), eq(groupMembers.status, "active")));

  if (groupMembership.length === 0) {
    return { success: false, error: "You are not an active member of this group" };
  }

  // 2. Monetary arithmetic in integer minor units (halalas)
  const totalMinor = toMinorUnits(amount);

  let calculatedSplits: SplitResult[] = [];

  if (splitType === "equal") {
    try {
      calculatedSplits = calculateEqualSplits(totalMinor, participants, paidBy);
    } catch (e: any) {
      return { success: false, error: e.message || "Failed to calculate equal splits" };
    }
  } else {
    // Custom split validation
    if (!customSplits || customSplits.length === 0) {
      return { success: false, error: "Custom splits must be specified for each participant" };
    }
    calculatedSplits = customSplits.map((cs) => ({
      userId: cs.userId,
      shareMinor: toMinorUnits(cs.shareAmount || 0),
    }));

    const isValid = validateCustomSplits(totalMinor, calculatedSplits);
    if (!isValid) {
      const sum = calculatedSplits.reduce((acc, c) => acc + c.shareMinor, BigInt(0));
      return {
        success: false,
        error: `Custom shares do not add up to total expense. Total: ${totalMinor} minor units, Sum: ${sum} minor units`,
      };
    }
  }

  // 3. Atomic Database Transaction
  try {
    const expenseId = await db.transaction(async (tx) => {
      // 1. Insert expense row
      const [newExpense] = await tx
        .insert(expenses)
        .values({
          groupId,
          createdBy: session.id,
          paidBy,
          amountMinor: totalMinor,
          currency,
          description,
          category,
          status: "active",
        })
        .returning();

      // 2. Insert expense splits
      for (const split of calculatedSplits) {
        await tx.insert(expenseSplits).values({
          expenseId: newExpense.id,
          userId: split.userId,
          shareMinor: split.shareMinor,
          decisionStatus: split.userId === paidBy ? "accepted" : "pending",
        });
      }

      // 3. Insert audit event
      await tx.insert(expenseEvents).values({
        expenseId: newExpense.id,
        actorId: session.id,
        eventType: "created",
        details: {
          description,
          totalMinor: totalMinor.toString(),
          splitCount: calculatedSplits.length,
          splitType,
        },
      });

      // 4. Insert transactional outbox event for notifications
      await tx.insert(outboxEvents).values({
        eventType: "expense.created",
        payload: {
          expenseId: newExpense.id,
          groupId,
          paidBy,
          description,
          amountMinor: totalMinor.toString(),
          participants,
        },
      });

      return newExpense.id;
    });

    revalidatePath("/dashboard");
    revalidatePath("/expenses");
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/balances");

    return { success: true, expenseId };
  } catch (err: any) {
    console.error("Expense creation transaction failed:", err);
    return { success: false, error: err.message || "Failed to create expense" };
  }
}

export async function disputeExpenseAction(expenseId: string, reason: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const parsed = disputeExpenseSchema.safeParse({ expenseId, reason });
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid dispute input" };
  }

  try {
    await db.transaction(async (tx) => {
      // Update expense status to disputed
      await tx
        .update(expenses)
        .set({ status: "disputed", updatedAt: new Date() })
        .where(eq(expenses.id, expenseId));

      // Update caller's split decisionStatus to disputed
      await tx
        .update(expenseSplits)
        .set({ decisionStatus: "disputed" })
        .where(and(eq(expenseSplits.expenseId, expenseId), eq(expenseSplits.userId, session.id)));

      // Add audit event
      await tx.insert(expenseEvents).values({
        expenseId,
        actorId: session.id,
        eventType: "disputed",
        details: { reason },
      });

      // Add outbox notification
      await tx.insert(outboxEvents).values({
        eventType: "expense.disputed",
        payload: { expenseId, disputerId: session.id, reason },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath(`/expenses/${expenseId}`);
    revalidatePath("/balances");
    return { success: true, message: "Expense has been marked as disputed." };
  } catch (err: any) {
    console.error("Expense dispute failed:", err);
    return { success: false, error: err.message || "Failed to dispute expense" };
  }
}
