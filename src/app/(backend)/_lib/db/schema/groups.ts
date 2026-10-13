import { pgTable, text, timestamp, uuid, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  defaultCurrency: varchar("default_currency", { length: 3 }).default("SAR").notNull(),
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active' | 'archived'
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const groupMembers = pgTable("group_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).default("member").notNull(), // 'owner' | 'admin' | 'member'
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active' | 'invited' | 'left'
  joinedAt: timestamp("joined_at", { mode: "date" }).defaultNow().notNull(),
});

export const groupInvitations = pgTable("group_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 64 }).notNull().unique(),
  invitedBy: uuid("invited_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { mode: "date" }).notNull(),
  maxUses: integer("max_uses").default(0).notNull(), // 0 = unlimited during validity period, 1 = single use
  useCount: integer("use_count").default(0).notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
