import { NextResponse } from "next/server";
import { db } from "@/app/(backend)/_lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "unknown";
  let dbError: string | null = null;

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
    timestamp: new Date().toISOString(),
  });
}

