export interface GroupMemberItem {
  id: string;
  userId: string;
  name: string;
  username: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "active" | "invited" | "left";
  joinedAt: Date;
  netBalanceMinor: bigint; // positive = owed by group, negative = owes group
}

export interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  defaultCurrency: string;
  createdAt: Date;
  updatedAt: Date;
  members: GroupMemberItem[];
  currentUserRole: "owner" | "admin" | "member";
  userNetBalanceMinor: bigint;
  totalExpensesCount: number;
}
