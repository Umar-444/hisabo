import { integer, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const outboxEvents = pgTable("outbox_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  payload: jsonb("payload").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending' | 'processing' | 'completed' | 'failed'
  attempts: integer("attempts").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  processedAt: timestamp("processed_at", { mode: "date" }),
});

export const idempotencyKeys = pgTable("idempotency_keys", {
  key: varchar("key", { length: 128 }).primaryKey(),
  userId: uuid("user_id").notNull(),
  responsePayload: jsonb("response_payload"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
});

export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: varchar("target_id", { length: 128 }).notNull(),
  details: jsonb("details"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
