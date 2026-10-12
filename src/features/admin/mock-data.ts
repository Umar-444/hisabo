import { AdminUserRecord, AdminGroupRecord, AdminAuditLogRecord, AdminStats } from "./types";

export const initialAdminStats: AdminStats = {
  totalUsers: 248,
  activeGroups: 42,
  totalVolumeMinor: BigInt(18450000), // SAR 184,500.00
  outstandingVolumeMinor: BigInt(4320000), // SAR 43,200.00
  outboxPending: 3,
  outboxSuccessRate: 99.8,
};

export const initialAdminUsers: AdminUserRecord[] = [
  {
    id: "usr-01",
    name: "Umar Farooq",
    email: "umar@hisabo.com",
    username: "umar",
    role: "admin",
    status: "active",
    totalExpensesCount: 38,
    joinedAt: "2026-09-01",
  },
  {
    id: "usr-02",
    name: "Ali Al-Mansoor",
    email: "ali@example.com",
    username: "aliman",
    role: "user",
    status: "active",
    totalExpensesCount: 19,
    joinedAt: "2026-09-04",
  },
  {
    id: "usr-03",
    name: "Ahmed Hassan",
    email: "ahmed@example.com",
    username: "ahmed_h",
    role: "user",
    status: "active",
    totalExpensesCount: 24,
    joinedAt: "2026-09-08",
  },
  {
    id: "usr-04",
    name: "Bilal Tariq",
    email: "bilal@example.com",
    username: "bilal99",
    role: "user",
    status: "active",
    totalExpensesCount: 14,
    joinedAt: "2026-09-12",
  },
  {
    id: "usr-05",
    name: "Zaid Khalid",
    email: "zaid@example.com",
    username: "zaidk",
    role: "user",
    status: "suspended",
    totalExpensesCount: 2,
    joinedAt: "2026-09-20",
  },
  {
    id: "usr-06",
    name: "Sara Al-Otaibi",
    email: "sara@example.com",
    username: "sara_otaibi",
    role: "user",
    status: "active",
    totalExpensesCount: 31,
    joinedAt: "2026-09-25",
  },
];

export const initialAdminGroups: AdminGroupRecord[] = [
  {
    id: "grp-01",
    name: "Al-Malqa Apartment 4B",
    ownerName: "Umar Farooq",
    ownerEmail: "umar@hisabo.com",
    currency: "SAR",
    membersCount: 4,
    totalExpensesMinor: BigInt(6240000), // SAR 62,400.00
    status: "active",
    createdAt: "2026-09-01",
  },
  {
    id: "grp-02",
    name: "Weekend Al-Ula Roadtrip",
    ownerName: "Ali Al-Mansoor",
    ownerEmail: "ali@example.com",
    currency: "SAR",
    membersCount: 6,
    totalExpensesMinor: BigInt(1480000), // SAR 14,800.00
    status: "active",
    createdAt: "2026-09-15",
  },
  {
    id: "grp-03",
    name: "Riyadh Tech Roommates",
    ownerName: "Ahmed Hassan",
    ownerEmail: "ahmed@example.com",
    currency: "SAR",
    membersCount: 3,
    totalExpensesMinor: BigInt(4520000), // SAR 45,200.00
    status: "active",
    createdAt: "2026-09-18",
  },
  {
    id: "grp-04",
    name: "Red Sea Diving Trip",
    ownerName: "Sara Al-Otaibi",
    ownerEmail: "sara@example.com",
    currency: "SAR",
    membersCount: 5,
    totalExpensesMinor: BigInt(2910000), // SAR 29,100.00
    status: "active",
    createdAt: "2026-09-28",
  },
];

export const initialAdminAuditLogs: AdminAuditLogRecord[] = [
  {
    id: "log-01",
    actorName: "Hisabo Administrator",
    actorEmail: "admin@hisabo.com",
    action: "SUSPEND_USER",
    targetType: "user",
    targetId: "usr-05",
    details: "Suspended user zaidk due to suspected payment claim abuse",
    ipAddress: "192.168.1.45",
    timestamp: "2026-10-10 14:22:10",
  },
  {
    id: "log-02",
    actorName: "Hisabo Administrator",
    actorEmail: "admin@hisabo.com",
    action: "OUTBOX_RETRY",
    targetType: "outbox_job",
    targetId: "job-8812",
    details: "Manually triggered push notification retry for dinner settlement",
    ipAddress: "192.168.1.45",
    timestamp: "2026-10-09 11:05:43",
  },
  {
    id: "log-03",
    actorName: "Hisabo Administrator",
    actorEmail: "admin@hisabo.com",
    action: "FLAG_GROUP",
    targetType: "group",
    targetId: "grp-99",
    details: "Archived inactive duplicate test group",
    ipAddress: "192.168.1.45",
    timestamp: "2026-10-08 09:12:00",
  },
  {
    id: "log-04",
    actorName: "Hisabo Administrator",
    actorEmail: "admin@hisabo.com",
    action: "ROLE_CHANGE",
    targetType: "user",
    targetId: "usr-01",
    details: "Promoted Umar Farooq to admin tier",
    ipAddress: "192.168.1.45",
    timestamp: "2026-10-01 10:00:00",
  },
];
