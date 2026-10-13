"use server";

import { db } from "@/app/(backend)/_lib/db";
import { settlements, settlementEvents, outboxEvents } from "@/app/(backend)/_lib/db/schema";
import { getUserSession } from "@/lib/auth/user-session";
import { createSettlementSchema, CreateSettlementInput } from "./schema";
import { toMinorUnits } from "@/lib/money";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { createInternalNotification } from "@/features/notifications";

export async function recordSettlementAction(input: CreateSettlementInput) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const parsed = createSettlementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid settlement data" };
  }

  const { groupId, payeeId, amount, currency, paymentMethod, note } = parsed.data;

  if (session.id === payeeId) {
    return { success: false, error: "You cannot settle up with yourself" };
  }

  const amountMinor = toMinorUnits(amount);

  try {
    const settlementId = await db.transaction(async (tx) => {
      const [newSettlement] = await tx
        .insert(settlements)
        .values({
          groupId,
          payerId: session.id,
          payeeId,
          amountMinor,
          currency,
          paymentMethod,
          note,
          status: "pending",
        })
        .returning();

      await tx.insert(settlementEvents).values({
        settlementId: newSettlement.id,
        actorId: session.id,
        eventType: "claimed",
        details: { amountMinor: amountMinor.toString(), paymentMethod },
      });

      await tx.insert(outboxEvents).values({
        eventType: "settlement.created",
        payload: {
          settlementId: newSettlement.id,
          groupId,
          payerId: session.id,
          payeeId,
          amountMinor: amountMinor.toString(),
        },
      });

      return newSettlement.id;
    });

    await createInternalNotification(
      payeeId,
      "settlement_claimed",
      "Settlement Payment Claimed",
      `${session.name} claimed they transferred ${currency} ${amount.toFixed(2)} to you. Please confirm receipt or review.`,
      "/settlements"
    );

    revalidatePath("/dashboard");
    revalidatePath("/balances");
    revalidatePath("/settlements");
    revalidatePath(`/groups/${groupId}`);

    return { success: true, settlementId };
  } catch (err: any) {
    console.error("Record settlement failed:", err);
    return { success: false, error: err.message || "Failed to record settlement" };
  }
}

export async function confirmSettlementAction(settlementId: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const [settlement] = await db
      .select()
      .from(settlements)
      .where(and(eq(settlements.id, settlementId), eq(settlements.payeeId, session.id)));

    if (!settlement) {
      return { success: false, error: "Settlement not found or you are not authorized to confirm it" };
    }

    if (settlement.status === "confirmed") {
      return { success: true, message: "Settlement is already confirmed" };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(settlements)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(eq(settlements.id, settlementId));

      await tx.insert(settlementEvents).values({
        settlementId,
        actorId: session.id,
        eventType: "confirmed",
      });

      await tx.insert(outboxEvents).values({
        eventType: "settlement.confirmed",
        payload: { settlementId, confirmedBy: session.id },
      });
    });

    await createInternalNotification(
      settlement.payerId,
      "settlement_confirmed",
      "Settlement Confirmed 🎉",
      `Your payment of ${settlement.currency} ${(Number(settlement.amountMinor) / 100).toFixed(2)} was confirmed by ${session.name}.`,
      "/balances"
    );

    revalidatePath("/dashboard");
    revalidatePath("/balances");
    revalidatePath("/settlements");
    revalidatePath(`/groups/${settlement.groupId}`);

    return { success: true, message: "Payment confirmed and balance updated!" };
  } catch (err: any) {
    console.error("Confirm settlement failed:", err);
    return { success: false, error: err.message || "Failed to confirm settlement" };
  }
}

export async function disputeSettlementAction(settlementId: string, reason: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const [settlement] = await db
      .select()
      .from(settlements)
      .where(and(eq(settlements.id, settlementId), eq(settlements.payeeId, session.id)));

    if (!settlement) {
      return { success: false, error: "Settlement not found or you are not authorized" };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(settlements)
        .set({ status: "disputed", updatedAt: new Date() })
        .where(eq(settlements.id, settlementId));

      await tx.insert(settlementEvents).values({
        settlementId,
        actorId: session.id,
        eventType: "disputed",
        details: { reason },
      });

      await tx.insert(outboxEvents).values({
        eventType: "settlement.disputed",
        payload: { settlementId, disputedBy: session.id, reason },
      });
    });

    await createInternalNotification(
      settlement.payerId,
      "dispute_raised",
      "Payment Claim Disputed ⚠️",
      `Your settlement claim was marked as disputed by ${session.name}. Reason: ${reason}`,
      "/settlements"
    );

    revalidatePath("/dashboard");
    revalidatePath("/balances");
    revalidatePath("/settlements");

    return { success: true, message: "Settlement marked as disputed" };
  } catch (err: any) {
    console.error("Dispute settlement failed:", err);
    return { success: false, error: err.message || "Failed to dispute settlement" };
  }
}
