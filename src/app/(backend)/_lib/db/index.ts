import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://user:password@ep-young-brook-45994299-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require";

// Cache sql client across hot-reloads in development
const globalForDb = globalThis as unknown as {
  sql: ReturnType<typeof neon> | undefined;
};

const sql = globalForDb.sql ?? neon(connectionString);
if (process.env.NODE_ENV !== "production") globalForDb.sql = sql;

export const db = drizzle(sql, { schema });
