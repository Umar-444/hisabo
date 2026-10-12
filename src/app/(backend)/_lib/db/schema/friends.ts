import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const friendships = pgTable("friendships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  friendId: uuid("friend_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending' | 'accepted' | 'blocked'
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const friendInvitations = pgTable("friend_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  recipientEmail: varchar("recipient_email", { length: 255 }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
