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

async function main() {
  console.log("Connecting to Neon database and ensuring system tables exist...");

  // 1. Ensure system_settings table
  await sql`
    CREATE TABLE IF NOT EXISTS "system_settings" (
      "key" varchar(50) PRIMARY KEY,
      "value" jsonb NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `;
  console.log("✓ system_settings table verified/created.");

  // 2. Ensure push_subscriptions table
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
  console.log("✓ push_subscriptions table verified/created.");

  // 3. Ensure default feature_flags record exists
  await sql`
    INSERT INTO "system_settings" ("key", "value", "updated_at")
    VALUES (
      'feature_flags',
      '{"registrationsEnabled": true, "exportEnabled": true, "maintenanceMode": false}'::jsonb,
      now()
    )
    ON CONFLICT ("key") DO NOTHING;
  `;
  console.log("✓ default feature_flags seeded.");

  // 4. Ensure default announcement record exists
  await sql`
    INSERT INTO "system_settings" ("key", "value", "updated_at")
    VALUES (
      'announcement',
      '{"active": false, "message": "", "type": "info"}'::jsonb,
      now()
    )
    ON CONFLICT ("key") DO NOTHING;
  `;
  console.log("✓ default announcement seeded.");

  console.log("Done!");
}

main().catch((err) => {
  console.error("Error ensuring tables:", err);
  process.exit(1);
});
