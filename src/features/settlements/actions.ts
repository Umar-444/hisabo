"use server";

import { db } from "@/app/(backend)/_lib/db";
import {
  settlements,
  settlementEvents,
  outboxEvents,
  paymentRequests,
  groups,
  groupMembers,
  users,
  expenses,
  adminAuditLogs,
} from "@/app/(backend)/_lib/db/schema";
import { getUserSession } from "@/lib/auth/user-session";
import {
  createSettlementSchema,
  CreateSettlementInput,
  rejectSettlementSchema,
  RejectSettlementInput,
  requestPaymentSchema,
  RequestPaymentInput,
  remindAllGroupDebtorsSchema,
  RemindAllGroupDebtorsInput,
  quickPaySettlementSchema,
  QuickPaySettlementInput,
  adminOverrideSettlementSchema,
  AdminOverrideSettlementInput,
} from "./schema";
import { toMinorUnits } from "@/lib/money";
import { revalidatePath } from "next/cache";
import { eq, and, or, desc, gte } from "drizzle-orm";
import { createInternalNotification } from "@/features/notifications";
import { getPairwiseDebtMinor } from "./queries";
import { getGroupDetailQuery } from "@/features/groups/queries";

/**
 * Standard settlement recording
 */
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

  // Invariant: One PENDING claim per (group, debtor, creditor) at a time
  const [existingPending] = await db
    .select({ id: settlements.id, amountMinor: settlements.amountMinor, currency: settlements.currency })
    .from(settlements)
    .where(
      and(
        eq(settlements.groupId, groupId),
        eq(settlements.payerId, session.id),
        eq(settlements.payeeId, payeeId),
        eq(settlements.status, "pending")
      )
    )
    .limit(1);

  if (existingPending) {
    const existingFormatted = `${existingPending.currency} ${(Number(existingPending.amountMinor) / 100).toFixed(2)}`;
    return {
      success: false,
      error: `You already have a pending ${existingFormatted} claim with this member. Please wait for them to confirm or review it.`,
    };
  }

  const amountMinor = toMinorUnits(amount);

  // Invariant: Amount capped at outstanding balance
  const outstandingDebt = await getPairwiseDebtMinor(session.id, payeeId, groupId);
  if (outstandingDebt > BigInt(0) && amountMinor > outstandingDebt) {
    const maxFormatted = `${currency} ${(Number(outstandingDebt) / 100).toFixed(2)}`;
    return {
      success: false,
      error: `Amount cannot exceed your outstanding balance of ${maxFormatted}.`,
    };
  }

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

/**
 * Quick Pay Action (Tapping amounts anywhere opens Quick-Pay with idempotency protection)
 */
export async function quickPaySettlementAction(input: QuickPaySettlementInput) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const parsed = quickPaySettlementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid payment details" };
  }

  const { groupId, payeeId, amount, currency, paymentMethod, note, idempotencyKey, requestedBy } = parsed.data;

  if (session.id === payeeId) {
    return { success: false, error: "You cannot settle up with yourself" };
  }

  // Idempotency: Double-submit protection
  if (idempotencyKey) {
    const [existing] = await db
      .select({ id: settlements.id })
      .from(settlements)
      .where(eq(settlements.idempotencyKey, idempotencyKey));
    if (existing) {
      return { success: true, settlementId: existing.id, message: "Claim already recorded" };
    }
  }

  // Invariant: One PENDING claim per (group, debtor, creditor) at a time
  const [existingPending] = await db
    .select({ id: settlements.id, amountMinor: settlements.amountMinor, currency: settlements.currency })
    .from(settlements)
    .where(
      and(
        eq(settlements.groupId, groupId),
        eq(settlements.payerId, session.id),
        eq(settlements.payeeId, payeeId),
        eq(settlements.status, "pending")
      )
    )
    .limit(1);

  if (existingPending) {
    const existingFormatted = `${existingPending.currency} ${(Number(existingPending.amountMinor) / 100).toFixed(2)}`;
    return {
      success: false,
      error: `You already have a pending ${existingFormatted} claim with this member. Please wait for them to confirm or review it.`,
    };
  }

  const amountMinor = toMinorUnits(amount);

  // Invariant: Amount capped at outstanding balance (editable downward only)
  const outstandingDebt = await getPairwiseDebtMinor(session.id, payeeId, groupId);
  if (outstandingDebt > BigInt(0) && amountMinor > outstandingDebt) {
    const maxFormatted = `${currency} ${(Number(outstandingDebt) / 100).toFixed(2)}`;
    return {
      success: false,
      error: `Amount cannot exceed your outstanding balance of ${maxFormatted}.`,
    };
  }

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
          idempotencyKey: idempotencyKey || null,
          requestedBy: requestedBy || null,
          status: "pending",
        })
        .returning();

      await tx.insert(settlementEvents).values({
        settlementId: newSettlement.id,
        actorId: session.id,
        eventType: "claimed",
        details: { amountMinor: amountMinor.toString(), paymentMethod, isQuickPay: true },
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

    // Notify creditor (§7 copy)
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

    return { success: true, settlementId, message: "Payment claim recorded. Waiting for recipient to confirm." };
  } catch (err: any) {
    console.error("Quick pay failed:", err);
    return { success: false, error: err.message || "Failed to process quick pay claim" };
  }
}

/**
 * Confirm / Approve Settlement
 * Either the recipient (creditor) or a group admin/owner can confirm.
 */
export async function confirmSettlementAction(settlementId: string) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  try {
    const [settlement] = await db
      .select()
      .from(settlements)
      .where(eq(settlements.id, settlementId));

    if (!settlement) {
      return { success: false, error: "Settlement not found" };
    }

    if (settlement.status === "confirmed") {
      return { success: true, message: "Settlement is already confirmed" };
    }

    // Check authorization: payee or group admin/owner or platform admin
    const isPayee = settlement.payeeId === session.id;
    let isGroupAdmin = session.role === "admin";

    if (!isPayee && !isGroupAdmin) {
      const [grp] = await db.select({ ownerId: groups.ownerId }).from(groups).where(eq(groups.id, settlement.groupId));
      if (grp?.ownerId === session.id) {
        isGroupAdmin = true;
      } else {
        const [membership] = await db
          .select({ role: groupMembers.role })
          .from(groupMembers)
          .where(and(eq(groupMembers.groupId, settlement.groupId), eq(groupMembers.userId, session.id)));
        if (membership?.role === "owner" || membership?.role === "admin") {
          isGroupAdmin = true;
        }
      }
    }

    if (!isPayee && !isGroupAdmin) {
      return { success: false, error: "You are not authorized to confirm this payment" };
    }

    const isOverride = !isPayee && isGroupAdmin;

    await db.transaction(async (tx) => {
      await tx
        .update(settlements)
        .set({
          status: "confirmed",
          decidedBy: session.id,
          decidedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(settlements.id, settlementId));

      await tx.insert(settlementEvents).values({
        settlementId,
        actorId: session.id,
        eventType: isOverride ? "admin_override" : "confirmed",
        details: isOverride
          ? { action: "confirmed", adminId: session.id, role: session.role }
          : undefined,
      });

      if (isOverride) {
        await tx.insert(adminAuditLogs).values({
          adminId: session.id,
          action: "settlement.override_confirm",
          targetType: "settlement",
          targetId: settlementId,
          details: { groupId: settlement.groupId, payerId: settlement.payerId, payeeId: settlement.payeeId },
        });
      }

      await tx.insert(outboxEvents).values({
        eventType: "settlement.confirmed",
        payload: { settlementId, confirmedBy: session.id, isOverride },
      });
    });

    const [payer] = await db.select({ name: users.name }).from(users).where(eq(users.id, settlement.payerId));
    const [payee] = await db.select({ name: users.name }).from(users).where(eq(users.id, settlement.payeeId));

    const debtorName = payer?.name || "Debtor";
    const creditorName = payee?.name || "Creditor";
    const amountStr = `${settlement.currency} ${(Number(settlement.amountMinor) / 100).toFixed(2)}`;

    // Exact notifications copy (§7):
    // debtor: "{creditor} confirmed your {amount} payment. Settled."
    // creditor: "You confirmed {debtor}'s {amount} payment."
    await createInternalNotification(
      settlement.payerId,
      "settlement_confirmed",
      "Payment Confirmed 🎉",
      `${isOverride ? `${session.name} (Admin)` : creditorName} confirmed your ${amountStr} payment. Settled.`,
      "/balances"
    );

    if (!isPayee) {
      // Notify creditor about admin override
      await createInternalNotification(
        settlement.payeeId,
        "settlement_confirmed",
        "Payment Approved by Admin",
        `${session.name} (Group Admin) confirmed ${debtorName}'s ${amountStr} payment to you.`,
        "/settlements"
      );
    } else {
      await createInternalNotification(
        settlement.payeeId,
        "settlement_confirmed",
        "Payment Confirmed",
        `You confirmed ${debtorName}'s ${amountStr} payment.`,
        "/settlements"
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/balances");
    revalidatePath("/settlements");
    revalidatePath(`/groups/${settlement.groupId}`);

    return { success: true, message: "Payment confirmed! Balance has been settled." };
  } catch (err: any) {
    console.error("Confirm settlement failed:", err);
    return { success: false, error: err.message || "Failed to confirm settlement" };
  }
}

/**
 * Reject Settlement with Structured Reason (§3 & §5 of Hisabo-new.md)
 */
export async function rejectSettlementAction(input: RejectSettlementInput) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const parsed = rejectSettlementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid rejection details" };
  }

  const { settlementId, reason, note } = parsed.data;

  try {
    const [settlement] = await db
      .select()
      .from(settlements)
      .where(eq(settlements.id, settlementId));

    if (!settlement) {
      return { success: false, error: "Settlement not found" };
    }

    if (settlement.status !== "pending") {
      return { success: false, error: `Cannot reject a settlement that is already ${settlement.status}` };
    }

    // Authorization: payee or group admin/owner or platform admin
    const isPayee = settlement.payeeId === session.id;
    let isGroupAdmin = session.role === "admin";

    if (!isPayee && !isGroupAdmin) {
      const [grp] = await db.select({ ownerId: groups.ownerId }).from(groups).where(eq(groups.id, settlement.groupId));
      if (grp?.ownerId === session.id) {
        isGroupAdmin = true;
      } else {
        const [membership] = await db
          .select({ role: groupMembers.role })
          .from(groupMembers)
          .where(and(eq(groupMembers.groupId, settlement.groupId), eq(groupMembers.userId, session.id)));
        if (membership?.role === "owner" || membership?.role === "admin") {
          isGroupAdmin = true;
        }
      }
    }

    if (!isPayee && !isGroupAdmin) {
      return { success: false, error: "You are not authorized to reject this payment" };
    }

    const isOverride = !isPayee && isGroupAdmin;

    await db.transaction(async (tx) => {
      await tx
        .update(settlements)
        .set({
          status: "rejected",
          rejectionReason: reason,
          rejectionNote: note || null,
          decidedBy: session.id,
          decidedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(settlements.id, settlementId));

      await tx.insert(settlementEvents).values({
        settlementId,
        actorId: session.id,
        eventType: isOverride ? "admin_override" : "rejected",
        details: { reason, note, isOverride, rejectedBy: session.id },
      });

      if (isOverride) {
        await tx.insert(adminAuditLogs).values({
          adminId: session.id,
          action: "settlement.override_reject",
          targetType: "settlement",
          targetId: settlementId,
          details: { reason, note, groupId: settlement.groupId },
        });
      }

      await tx.insert(outboxEvents).values({
        eventType: "claim.rejected",
        payload: { settlementId, rejectedBy: session.id, reason, note, isOverride },
      });
    });

    const [payer] = await db.select({ name: users.name }).from(users).where(eq(users.id, settlement.payerId));
    const debtorName = payer?.name || "Debtor";
    const amountStr = `${settlement.currency} ${(Number(settlement.amountMinor) / 100).toFixed(2)}`;

    // Exact notifications copy (§7):
    // debtor: "Your payment was not confirmed ({reason}). {amount} is still owed."
    // creditor: "{debtor}'s {amount} claim was rejected."
    await createInternalNotification(
      settlement.payerId,
      "settlement_rejected",
      "Payment Claim Not Confirmed",
      `Your payment was not confirmed (reason: ${reason}). ${amountStr} is still owed.`,
      "/balances"
    );

    if (isPayee) {
      await createInternalNotification(
        settlement.payeeId,
        "settlement_rejected",
        "Claim Rejected",
        `${debtorName}'s ${amountStr} claim was rejected.`,
        "/settlements"
      );
    } else {
      await createInternalNotification(
        settlement.payeeId,
        "settlement_rejected",
        "Claim Rejected by Admin",
        `${debtorName}'s ${amountStr} claim was rejected by Admin ${session.name}.`,
        "/settlements"
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/balances");
    revalidatePath("/settlements");
    revalidatePath(`/groups/${settlement.groupId}`);

    return { success: true, message: "Payment claim has been rejected. Debt remains active." };
  } catch (err: any) {
    console.error("Reject settlement failed:", err);
    return { success: false, error: err.message || "Failed to reject settlement" };
  }
}

/**
 * Dispute Settlement (legacy alias mapping to rejection flow with note)
 */
export async function disputeSettlementAction(settlementId: string, reason: string) {
  return rejectSettlementAction({
    settlementId,
    reason: "Other",
    note: reason,
  });
}

/**
 * Step 1: Request Payment with 24-hour Cooldown
 */
export async function requestPaymentAction(input: RequestPaymentInput) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const parsed = requestPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid request data" };
  }

  const { groupId, debtorId, amount, currency, expenseId } = parsed.data;

  if (session.id === debtorId) {
    return { success: false, error: "You cannot request payment from yourself" };
  }

  // Anti-harassment: 24h cooldown
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [existingRequest] = await db
    .select({ requestedAt: paymentRequests.requestedAt })
    .from(paymentRequests)
    .where(
      and(
        eq(paymentRequests.groupId, groupId),
        eq(paymentRequests.creditorId, session.id),
        eq(paymentRequests.debtorId, debtorId),
        gte(paymentRequests.requestedAt, cutoff)
      )
    )
    .orderBy(desc(paymentRequests.requestedAt))
    .limit(1);

  if (existingRequest) {
    const elapsedMs = Date.now() - existingRequest.requestedAt.getTime();
    const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
    return {
      success: false,
      error: `Payment already requested ${elapsedHours > 0 ? `${elapsedHours}h ago` : "recently"}. Please wait 24h before requesting again.`,
    };
  }

  const amountMinor = toMinorUnits(amount);

  try {
    await db.insert(paymentRequests).values({
      groupId,
      creditorId: session.id,
      debtorId,
      amountMinor,
      currency,
      expenseId: expenseId || null,
    });

    const [grp] = await db.select({ name: groups.name }).from(groups).where(eq(groups.id, groupId));
    let forContext = grp?.name || "group balance";
    if (expenseId) {
      const [exp] = await db.select({ description: expenses.description }).from(expenses).where(eq(expenses.id, expenseId));
      if (exp?.description) forContext = exp.description;
    }

    // Exact copy (§7): "Payment requested", "{creditor} requested {amount} for {expense/group}."
    // Link opens quick-pay sheet directly
    await createInternalNotification(
      debtorId,
      "payment_requested",
      "Payment requested",
      `${session.name} requested ${currency} ${amount.toFixed(2)} for ${forContext}.`,
      `/balances?quickPay=true&groupId=${groupId}&payeeId=${session.id}&amount=${amount}`
    );

    await db.insert(outboxEvents).values({
      eventType: "payment.requested",
      payload: {
        groupId,
        creditorId: session.id,
        debtorId,
        amountMinor: amountMinor.toString(),
        currency,
        expenseId,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/balances");
    revalidatePath(`/groups/${groupId}`);

    return { success: true, message: `Payment requested from user for ${currency} ${amount.toFixed(2)}.` };
  } catch (err: any) {
    console.error("Request payment failed:", err);
    return { success: false, error: err.message || "Failed to send payment request" };
  }
}

/**
 * Admin "Remind All" debtors in a group
 */
export async function remindAllGroupDebtorsAction(input: RemindAllGroupDebtorsInput) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const parsed = remindAllGroupDebtorsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid group" };
  }
  const { groupId } = parsed.data;

  // Authorization: Group admin/owner or platform admin
  const [grp] = await db.select().from(groups).where(eq(groups.id, groupId));
  if (!grp) {
    return { success: false, error: "Group not found" };
  }

  const [membership] = await db
    .select({ role: groupMembers.role })
    .from(groupMembers)
    .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, session.id)));

  const isAdmin =
    session.role === "admin" ||
    grp.ownerId === session.id ||
    membership?.role === "owner" ||
    membership?.role === "admin";

  if (!isAdmin) {
    return { success: false, error: "Only group admins or owners can remind all members." };
  }

  try {
    // Get all members with negative balance in this group
    const groupData = await getGroupDetailQuery(groupId, session.id);
    if (!groupData) {
      return { success: false, error: "Group not found or unauthorized" };
    }
    const debtors = groupData.members.filter(
      (m) => m.netBalanceMinor < BigInt(0) && m.userId !== session.id
    );

    if (debtors.length === 0) {
      return { success: true, message: "No outstanding debts in this group!" };
    }

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    let pingedCount = 0;

    for (const debtor of debtors) {
      // Cooldown check
      const [existingRequest] = await db
        .select({ id: paymentRequests.id })
        .from(paymentRequests)
        .where(
          and(
            eq(paymentRequests.groupId, groupId),
            eq(paymentRequests.creditorId, session.id),
            eq(paymentRequests.debtorId, debtor.userId),
            gte(paymentRequests.requestedAt, cutoff)
          )
        )
        .limit(1);

      if (existingRequest) {
        continue; // Skip if requested in the last 24h
      }

      const debtPositive: bigint = -debtor.netBalanceMinor;
      const amountVal = Number(debtPositive) / 100;

      await db.insert(paymentRequests).values({
        groupId,
        creditorId: session.id,
        debtorId: debtor.userId,
        amountMinor: debtPositive,
        currency: grp.defaultCurrency,
      });

      // Exact copy (§7):
      // "Group reminder: {creditor} requested {amount} for {expense/group}."
      await createInternalNotification(
        debtor.userId,
        "payment_requested",
        "Payment requested",
        `Group reminder: ${session.name} requested ${grp.defaultCurrency} ${amountVal.toFixed(2)} for ${grp.name}.`,
        `/balances?quickPay=true&groupId=${groupId}&payeeId=${session.id}&amount=${amountVal}`
      );

      pingedCount++;
    }

    await db.insert(outboxEvents).values({
      eventType: "payment.reminded_all",
      payload: {
        groupId,
        adminId: session.id,
        totalDebtorsPinged: pingedCount,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/balances");
    revalidatePath(`/groups/${groupId}`);

    return {
      success: true,
      message:
        pingedCount > 0
          ? `Reminded ${pingedCount} debtor${pingedCount > 1 ? "s" : ""} with outstanding balances.`
          : "All debtors were already reminded within the last 24 hours.",
    };
  } catch (err: any) {
    console.error("Remind all debtors failed:", err);
    return { success: false, error: err.message || "Failed to remind debtors" };
  }
}

/**
 * Admin Override Settlement Action
 */
export async function adminOverrideSettlementAction(input: AdminOverrideSettlementInput) {
  const session = await getUserSession();
  if (!session) {
    return { success: false, error: "Authentication required" };
  }

  const parsed = adminOverrideSettlementSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid override data" };
  }

  const { settlementId, decision, reason } = parsed.data;

  if (decision === "approve") {
    return confirmSettlementAction(settlementId);
  } else {
    return rejectSettlementAction({
      settlementId,
      reason: "Other",
      note: `Admin Override: ${reason}`,
    });
  }
}
