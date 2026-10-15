import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("Missing DATABASE_URL in environment.");
  process.exit(1);
}

const sql = neon(dbUrl);

const statements = [
  `CREATE TABLE IF NOT EXISTS "payment_requests" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "group_id" uuid NOT NULL,
    "creditor_id" uuid NOT NULL,
    "debtor_id" uuid NOT NULL,
    "amount_minor" bigint NOT NULL,
    "currency" varchar(3) DEFAULT 'SAR' NOT NULL,
    "expense_id" uuid,
    "requested_at" timestamp DEFAULT now() NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "system_settings" (
    "key" varchar(50) PRIMARY KEY NOT NULL,
    "value" jsonb NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS "currencies" (
    "code" varchar(3) PRIMARY KEY NOT NULL,
    "name" varchar(100) NOT NULL,
    "symbol" varchar(10) NOT NULL,
    "decimals" integer DEFAULT 2 NOT NULL,
    "is_live" boolean DEFAULT true NOT NULL,
    "is_default" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "default_currency" varchar(10) DEFAULT 'SAR' NOT NULL;`,
  `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "payment_handle" text;`,
  `ALTER TABLE "group_invitations" ADD COLUMN IF NOT EXISTS "max_uses" integer DEFAULT 0 NOT NULL;`,
  `ALTER TABLE "group_invitations" ADD COLUMN IF NOT EXISTS "use_count" integer DEFAULT 0 NOT NULL;`,
  `ALTER TABLE "group_invitations" ADD COLUMN IF NOT EXISTS "is_revoked" boolean DEFAULT false NOT NULL;`,
  `ALTER TABLE "groups" ADD COLUMN IF NOT EXISTS "status" varchar(20) DEFAULT 'active' NOT NULL;`,
  `ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "rejection_reason" varchar(100);`,
  `ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "rejection_note" text;`,
  `ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "idempotency_key" varchar(128);`,
  `ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "requested_by" uuid;`,
  `ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "decided_by" uuid;`,
  `ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "decided_at" timestamp;`,
  `ALTER TABLE "settlements" ADD COLUMN IF NOT EXISTS "escalated_to_admin_at" timestamp;`,
  `DO $$ BEGIN
    ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `DO $$ BEGIN
    ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_creditor_id_users_id_fk" FOREIGN KEY ("creditor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `DO $$ BEGIN
    ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_debtor_id_users_id_fk" FOREIGN KEY ("debtor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `DO $$ BEGIN
    ALTER TABLE "settlements" ADD CONSTRAINT "settlements_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `DO $$ BEGIN
    ALTER TABLE "settlements" ADD CONSTRAINT "settlements_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`,
  `DO $$ BEGIN
    ALTER TABLE "settlements" ADD CONSTRAINT "settlements_idempotency_key_unique" UNIQUE("idempotency_key");
  EXCEPTION
    WHEN duplicate_object THEN null;
  END $$;`
];

async function run() {
  console.log("Applying schema updates to Neon database...");
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    try {
      await (sql as any).query(stmt);
      console.log(`[${i + 1}/${statements.length}] Applied successfully.`);
    } catch (err: any) {
      console.error(`Error running statement ${i + 1}:`, err.message);
      throw err;
    }
  }
  console.log("All migrations applied successfully!");
}

run().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
