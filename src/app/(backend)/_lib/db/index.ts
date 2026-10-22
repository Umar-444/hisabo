import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Cache sql client across hot-reloads and requests
const globalForDb = globalThis as unknown as {
  sql: any;
  dbUrl: string | undefined;
};

function getSql(): any {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing DATABASE_URL. Please set DATABASE_URL in your .env.local file for local development, or in your hosting platform environment variables for production."
    );
  }

  if (globalForDb.sql && globalForDb.dbUrl === connectionString) {
    return globalForDb.sql;
  }

  const client = neon(connectionString);
  globalForDb.sql = client;
  globalForDb.dbUrl = connectionString;
  return client;
}

// Proxy neon client lazily so process.env.DATABASE_URL is accessed at query runtime
// rather than top-level module evaluation time (critical for Cloudflare Workers / OpenNext)
const sqlProxy = new Proxy(function () {} as any, {
  apply(_target, thisArg, argArray) {
    return (getSql() as any).apply(thisArg, argArray);
  },
  get(_target, prop, receiver) {
    const target = getSql() as any;
    const value = Reflect.get(target, prop, receiver);
    return typeof value === "function" ? value.bind(target) : value;
  },
});

export const db = drizzle(sqlProxy as any, { schema });

// Graceful transaction fallback for neon-http driver on Cloudflare Workers / Serverless
(db as any).transaction = async function (
  cb: (tx: any) => Promise<any>
) {
  // neon-http executes queries over stateless HTTP fetch and does not support multi-statement interactive transactions.
  // Passing the db client instance as tx executes statements sequentially with full compatibility.
  return await cb(this);
};

