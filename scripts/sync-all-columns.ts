import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Missing DATABASE_URL");
  process.exit(1);
}

const sql = neon(dbUrl);

async function sync() {
  console.log("Checking and syncing all PostgreSQL columns across all tables...");

  // 1. Groups table
  await sql`
    ALTER TABLE "groups" 
    ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'active' NOT NULL;
  `;
  console.log("✓ groups.status verified.");

  // 2. Users table
  await sql`
    ALTER TABLE "users" 
    ADD COLUMN IF NOT EXISTS "payment_handle" text,
    ADD COLUMN IF NOT EXISTS "default_currency" varchar(10) DEFAULT 'SAR' NOT NULL,
    ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'active' NOT NULL;
  `;
  console.log("✓ users columns verified (payment_handle, default_currency, status).");

  // 3. Group Invitations table
  await sql`
    ALTER TABLE "group_invitations"
    ADD COLUMN IF NOT EXISTS "max_uses" integer DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS "use_count" integer DEFAULT 0 NOT NULL,
    ADD COLUMN IF NOT EXISTS "is_revoked" boolean DEFAULT false NOT NULL;
  `;
  console.log("✓ group_invitations columns verified (max_uses, use_count, is_revoked).");

  // 4. Group Members table
  await sql`
    ALTER TABLE "group_members"
    ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'active' NOT NULL,
    ADD COLUMN IF NOT EXISTS "role" varchar(20) DEFAULT 'member' NOT NULL;
  `;
  console.log("✓ group_members columns verified (status, role).");

  // 5. Notifications table
  await sql`
    CREATE TABLE IF NOT EXISTS "notifications" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "type" varchar(50) NOT NULL,
      "title" varchar(255) NOT NULL,
      "message" text NOT NULL,
      "link" text,
      "payload" jsonb,
      "read_at" timestamp,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `;
  console.log("✓ notifications table verified.");

  // 6. Push subscriptions table
  await sql`
    CREATE TABLE IF NOT EXISTS "push_subscriptions" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "endpoint" text NOT NULL UNIQUE,
      "p256dh" text NOT NULL,
      "auth" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "revoked_at" timestamp
    );
  `;
  console.log("✓ push_subscriptions table verified.");

  // 7. System settings table
  await sql`
    CREATE TABLE IF NOT EXISTS "system_settings" (
      "key" varchar(50) PRIMARY KEY,
      "value" jsonb NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `;
  console.log("✓ system_settings table verified.");

  // 8. Admin audit logs table
  await sql`
    CREATE TABLE IF NOT EXISTS "admin_audit_logs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "adminId" uuid NOT NULL,
      "action" varchar(100) NOT NULL,
      "targetType" varchar(50) NOT NULL,
      "targetId" varchar(128) NOT NULL,
      "details" jsonb,
      "createdAt" timestamp DEFAULT now() NOT NULL
    );
  `;
  console.log("✓ admin_audit_logs table verified.");

  // Also check if admin_audit_logs has snake_case columns
  await sql`
    ALTER TABLE "admin_audit_logs"
    ADD COLUMN IF NOT EXISTS "admin_id" uuid,
    ADD COLUMN IF NOT EXISTS "target_type" varchar(50),
    ADD COLUMN IF NOT EXISTS "target_id" varchar(128),
    ADD COLUMN IF NOT EXISTS "created_at" timestamp DEFAULT now();
  `;

  // 9. Expenses table
  await sql`
    ALTER TABLE "expenses"
    ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'active' NOT NULL,
    ADD COLUMN IF NOT EXISTS "category" varchar(50) DEFAULT 'general' NOT NULL;
  `;
  console.log("✓ expenses columns verified.");

  // 10. Settlements table
  await sql`
    ALTER TABLE "settlements"
    ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'pending' NOT NULL,
    ADD COLUMN IF NOT EXISTS "payment_method" varchar(50) DEFAULT 'bank_transfer' NOT NULL;
  `;
  console.log("✓ settlements columns verified.");

  console.log("\nALL DATABASE TABLES AND COLUMNS FULLY SYNCHRONIZED!");
}

sync().catch((err) => {
  console.error("Sync error:", err);
  process.exit(1);
});
