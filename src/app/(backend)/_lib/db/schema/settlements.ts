import { bigint, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { groups } from "./groups";

export const settlements = pgTable("settlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  payerId: uuid("payer_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  payeeId: uuid("payee_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  amountMinor: bigint("amount_minor", { mode: "bigint" }).notNull(),
  currency: varchar("currency", { length: 3 }).default("SAR").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending' | 'confirmed' | 'disputed' | 'cancelled'
  paymentMethod: varchar("payment_method", { length: 50 }).default("bank_transfer").notNull(), // 'cash' | 'bank_transfer' | 'other'
  note: text("note"),
  receiptUrl: text("receipt_url"),
  settledAt: timestamp("settled_at", { mode: "date" }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const settlementEvents = pgTable("settlement_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  settlementId: uuid("settlement_id")
    .notNull()
    .references(() => settlements.id, { onDelete: "cascade" }),
  actorId: uuid("actor_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'claimed' | 'confirmed' | 'disputed' | 'cancelled'
  details: jsonb("details"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
