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
  let connectionString = process.env.DATABASE_URL;

  // Fallback 1: check Cloudflare runtime context if process.env is not populated
  if (!connectionString) {
    try {
      const { getCloudflareContext } = require("@opennextjs/cloudflare");
      const cf = getCloudflareContext();
      if (cf?.env?.DATABASE_URL && typeof cf.env.DATABASE_URL === "string") {
        connectionString = cf.env.DATABASE_URL;
      }
    } catch {
      // not in cloudflare worker or context unavailable
    }
  }

  // Fallback 2: check build-time environment bridged during Cloudflare Workers build
  if (!connectionString) {
    try {
      const buildEnv = require("./build-env.generated.json");
      if (buildEnv?.DATABASE_URL && typeof buildEnv.DATABASE_URL === "string") {
        connectionString = buildEnv.DATABASE_URL;
      }
    } catch {
      // no build env generated or file unavailable
    }
  }

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
// ensuring connectionString is accessed only when a request arrives (critical for Cloudflare Workers / OpenNext).
export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy({} as any, {
  get(_target, prop, receiver) {
    const realDb = getDb() as any;
    const value = Reflect.get(realDb, prop, receiver);
    return typeof value === "function" ? value.bind(realDb) : value;
  },
});
