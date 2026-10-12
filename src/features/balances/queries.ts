import "server-only";
import { db } from "@/app/(backend)/_lib/db";
import { groups, groupMembers, users, expenses, expenseSplits, settlements } from "@/app/(backend)/_lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export interface PeerBalanceItem {
  peerId: string;
  peerName: string;
  peerUsername: string;
  groupId: string;
  groupName: string;
  currency: string;
  netMinor: bigint; // positive = peer owes user, negative = user owes peer
}

export interface AggregatedBalancesResult {
  totalCreditMinor: bigint; // money owed to user
  totalDebitMinor: bigint;  // money user owes
  netTotalMinor: bigint;    // credit - debit
  currency: string;
  peerBalances: PeerBalanceItem[];
}

export async function getAggregatedBalancesQuery(userId: string): Promise<AggregatedBalancesResult> {
  // 1. Get all groups user belongs to
  const userGroupRows = await db
    .select({
      groupId: groups.id,
      groupName: groups.name,
      currency: groups.defaultCurrency,
    })
    .from(groupMembers)
    .innerJoin(groups, eq(groupMembers.groupId, groups.id))
    .where(and(eq(groupMembers.userId, userId), eq(groupMembers.status, "active")));

  if (userGroupRows.length === 0) {
    return {
      totalCreditMinor: BigInt(0),
      totalDebitMinor: BigInt(0),
      netTotalMinor: BigInt(0),
      currency: "SAR",
      peerBalances: [],
    };
  }

  const groupIds = userGroupRows.map((g) => g.groupId);

  // 2. Fetch all members in these groups
  const allMembers = await db
    .select({
      groupId: groupMembers.groupId,
      userId: users.id,
      name: users.name,
      username: users.username,
    })
    .from(groupMembers)
    .innerJoin(users, eq(groupMembers.userId, users.id))
    .where(and(sql`${groupMembers.groupId} IN ${groupIds}`, eq(groupMembers.status, "active")));

  const membersByGroup: Record<string, Record<string, { name: string; username: string }>> = {};
  for (const m of allMembers) {
    if (!membersByGroup[m.groupId]) membersByGroup[m.groupId] = {};
    membersByGroup[m.groupId][m.userId] = {
      name: m.name ?? "Member",
      username: m.username ?? "user",
    };
  }

  // 3. Fetch active expenses in these groups
  const allExpenses = await db
    .select({
      id: expenses.id,
      groupId: expenses.groupId,
      paidBy: expenses.paidBy,
      amountMinor: expenses.amountMinor,
    })
    .from(expenses)
    .where(and(sql`${expenses.groupId} IN ${groupIds}`, eq(expenses.status, "active")));

  const expenseIds = allExpenses.map((e) => e.id);
  let allSplits: { expenseId: string; userId: string; shareMinor: bigint }[] = [];
  if (expenseIds.length > 0) {
    allSplits = await db
      .select({
        expenseId: expenseSplits.expenseId,
        userId: expenseSplits.userId,
        shareMinor: expenseSplits.shareMinor,
      })
      .from(expenseSplits)
      .where(sql`${expenseSplits.expenseId} IN ${expenseIds}`);
  }

  const splitsByExpense: Record<string, { userId: string; shareMinor: bigint }[]> = {};
  for (const s of allSplits) {
    if (!splitsByExpense[s.expenseId]) splitsByExpense[s.expenseId] = [];
    splitsByExpense[s.expenseId].push(s);
  }

  // 4. Fetch confirmed settlements in these groups
  const allSettlements = await db
    .select({
      groupId: settlements.groupId,
      payerId: settlements.payerId,
      payeeId: settlements.payeeId,
      amountMinor: settlements.amountMinor,
    })
    .from(settlements)
    .where(and(sql`${settlements.groupId} IN ${groupIds}`, eq(settlements.status, "confirmed")));

  // Pairwise peer balances: key = `${groupId}:${peerId}`
  const pairwiseNet: Record<string, bigint> = {};

  // Compute expense balances
  for (const exp of allExpenses) {
    const splits = splitsByExpense[exp.id] || [];
    
    // Case A: User paid the expense -> each other participant owes user their split share
    if (exp.paidBy === userId) {
      for (const sp of splits) {
        if (sp.userId !== userId) {
          const key = `${exp.groupId}:${sp.userId}`;
          pairwiseNet[key] = (pairwiseNet[key] || BigInt(0)) + sp.shareMinor;
        }
      }
    } else {
      // Case B: Someone else paid -> if user is a participant, user owes the payer their split share
      const userSplit = splits.find((s) => s.userId === userId);
      if (userSplit) {
        const key = `${exp.groupId}:${exp.paidBy}`;
        pairwiseNet[key] = (pairwiseNet[key] || BigInt(0)) - userSplit.shareMinor;
      }
    }
  }

  // Apply settlements
  for (const st of allSettlements) {
    // If user paid peer a settlement: increases user's position towards peer (clearing debt)
    if (st.payerId === userId) {
      const key = `${st.groupId}:${st.payeeId}`;
      pairwiseNet[key] = (pairwiseNet[key] || BigInt(0)) + st.amountMinor;
    }
    // If peer paid user a settlement: decreases peer's debt to user
    else if (st.payeeId === userId) {
      const key = `${st.groupId}:${st.payerId}`;
      pairwiseNet[key] = (pairwiseNet[key] || BigInt(0)) - st.amountMinor;
    }
  }

  let totalCreditMinor = BigInt(0);
  let totalDebitMinor = BigInt(0);
  const peerBalances: PeerBalanceItem[] = [];

  for (const [key, net] of Object.entries(pairwiseNet)) {
    if (net === BigInt(0)) continue;

    const [grpId, peerId] = key.split(":");
    const groupInfo = userGroupRows.find((g) => g.groupId === grpId);
    const peerInfo = membersByGroup[grpId]?.[peerId];

    if (net > BigInt(0)) {
      totalCreditMinor += net;
    } else {
      totalDebitMinor += -net;
    }

    if (groupInfo && peerInfo) {
      peerBalances.push({
        peerId,
        peerName: peerInfo.name,
        peerUsername: peerInfo.username,
        groupId: grpId,
        groupName: groupInfo.groupName,
        currency: groupInfo.currency,
        netMinor: net,
      });
    }
  }

  // Sort: debts owed to user first, then debts user owes
  peerBalances.sort((a, b) => (b.netMinor > a.netMinor ? 1 : -1));

  return {
    totalCreditMinor,
    totalDebitMinor,
    netTotalMinor: totalCreditMinor - totalDebitMinor,
    currency: userGroupRows[0]?.currency || "SAR",
    peerBalances,
  };
}
