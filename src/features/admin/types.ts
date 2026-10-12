export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  username: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "pending";
  totalExpensesCount: number;
  joinedAt: string;
}

export interface AdminGroupRecord {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  currency: string;
  membersCount: number;
  totalExpensesMinor: bigint;
  status: "active" | "flagged" | "archived";
  createdAt: string;
}

export interface AdminAuditLogRecord {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  activeGroups: number;
  totalVolumeMinor: bigint;
  outstandingVolumeMinor: bigint;
  outboxPending: number;
  outboxSuccessRate: number;
}
