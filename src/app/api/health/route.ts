import { NextResponse } from "next/server";
import { db } from "@/app/(backend)/_lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "unknown";
  let dbError: string | null = null;
  const envCheck = {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    databaseUrlPrefix: process.env.DATABASE_URL ? process.env.DATABASE_URL.slice(0, 14) + "..." : "missing",
    nodeEnv: process.env.NODE_ENV,
    availableEnvKeys: Object.keys(process.env).sort(),
  };

  try {
    const start = Date.now();
    await db.execute(sql`SELECT 1 as ping`);
    dbStatus = `connected (${Date.now() - start}ms)`;
  } catch (err: any) {
    dbStatus = "error";
    dbError = err?.message || String(err);
  }

  return NextResponse.json({
    status: dbError ? "degraded" : "ok",
    database: dbStatus,
    dbError,
    envCheck,
    timestamp: new Date().toISOString(),
  });
}
