import { bigint, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { groups } from "./groups";

export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  paidBy: uuid("paid_by")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 50 }).default("general").notNull(), // food, groceries, rent, utilities, transport, entertainment, other
  receiptUrl: text("receipt_url"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active' | 'cancelled' | 'disputed'
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const expenseSplits = pgTable("expense_splits", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  shareMinor: bigint("share_minor", { mode: "bigint" }).notNull(),
  decisionStatus: varchar("decision_status", { length: 20 }).default("pending").notNull(), // 'pending' | 'accepted' | 'disputed'
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const expenseEvents = pgTable("expense_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id")
    .notNull()
    .references(() => expenses.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'created' | 'updated' | 'accepted' | 'disputed' | 'cancelled'
  details: jsonb("details"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
