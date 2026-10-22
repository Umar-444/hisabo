import { NextResponse } from "next/server";
import { db } from "@/app/(backend)/_lib/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  let dbStatus = "unknown";
  let dbError: string | null = null;
  let cfEnvKeys: string[] = [];
  let cfHasDbUrl = false;

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const cf = await getCloudflareContext({ async: true });
    if (cf?.env) {
      cfEnvKeys = Object.keys(cf.env).sort();
      cfHasDbUrl = Boolean((cf.env as any).DATABASE_URL);
    }
  } catch (e: any) {
    cfEnvKeys = ["error: " + (e?.message || String(e))];
  }

  let hasBuildEnvDbUrl = false;
  try {
    const buildEnv = require("@/app/(backend)/_lib/db/build-env.generated.json");
    hasBuildEnvDbUrl = Boolean(buildEnv?.DATABASE_URL);
  } catch {}

  const envCheck = {
    hasProcessDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasCfContextDatabaseUrl: cfHasDbUrl,
    hasBuildEnvDatabaseUrl: hasBuildEnvDbUrl,
    cfBindings: cfEnvKeys,
    nodeEnv: process.env.NODE_ENV,
    processEnvKeys: Object.keys(process.env).sort(),
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
