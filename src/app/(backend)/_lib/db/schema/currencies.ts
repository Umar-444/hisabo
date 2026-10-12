import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const currencies = pgTable("currencies", {
  code: varchar("code", { length: 3 }).primaryKey(), // 'SAR', 'USD', 'AED', 'EUR', 'GBP'
  name: varchar("name", { length: 100 }).notNull(),
  symbol: varchar("symbol", { length: 10 }).notNull(),
  decimals: integer("decimals").default(2).notNull(),
  isLive: boolean("is_live").default(true).notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export type CurrencyRow = typeof currencies.$inferSelect;
