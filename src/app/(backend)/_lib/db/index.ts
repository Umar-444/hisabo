import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_WHpvsM3ajn0e@ep-small-waterfall-b4kfrb0r-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

// Cache sql client across hot-reloads in development
const globalForDb = globalThis as unknown as {
  sql: ReturnType<typeof neon> | undefined;
};

const sql = globalForDb.sql ?? neon(connectionString);
if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

export const db = drizzle(sql, { schema });
