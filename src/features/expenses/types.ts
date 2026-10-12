export interface ExpenseSplitDetail {
  id: string;
  userId: string;
  userName: string;
  userUsername: string;
  shareMinor: bigint;
  decisionStatus: "pending" | "accepted" | "disputed";
}

export interface ExpenseDetail {
  id: string;
  groupId: string;
  groupName: string;
  description: string;
  amountMinor: bigint;
  currency: string;
  category: string;
  paidById: string;
  paidByName: string;
  paidByUsername: string;
  createdById: string;
  receiptUrl: string | null;
  status: "active" | "cancelled" | "disputed";
  createdAt: Date;
  splits: ExpenseSplitDetail[];
  userShareMinor: bigint | null;
  isUserPayer: boolean;
}
