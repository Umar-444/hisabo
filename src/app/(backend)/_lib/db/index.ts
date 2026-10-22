import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Cache db client across requests and hot-reloads
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
  dbUrl: string | undefined;
};

function getDb(): ReturnType<typeof drizzle<typeof schema>> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL. Please set DATABASE_URL in your .env.local file for local development, or in your hosting platform environment variables for production."
    );
  }

  if (globalForDb.db && globalForDb.dbUrl === connectionString) {
    return globalForDb.db;
  }

  const sql = neon(connectionString);
  const client = drizzle(sql, { schema });

  // Graceful transaction fallback for neon-http driver on Cloudflare Workers / Serverless
  (client as any).transaction = async function (cb: (tx: any) => Promise<any>) {
    return await cb(this);
  };

  globalForDb.db = client;
  globalForDb.dbUrl = connectionString;
  return client;
}

// Lazy Proxy for db: prevents drizzle() or neon() from evaluating at top-level module load time,
// ensuring process.env.DATABASE_URL is accessed only when a request arrives (critical for Cloudflare Workers / OpenNext).
export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy({} as any, {
  get(_target, prop, receiver) {
    const realDb = getDb() as any;
    const value = Reflect.get(realDb, prop, receiver);
    return typeof value === "function" ? value.bind(realDb) : value;
  },
});
