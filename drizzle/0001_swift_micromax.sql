CREATE TABLE "payment_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"group_id" uuid NOT NULL,
	"creditor_id" uuid NOT NULL,
	"debtor_id" uuid NOT NULL,
	"amount_minor" bigint NOT NULL,
	"currency" varchar(3) DEFAULT 'SAR' NOT NULL,
	"expense_id" uuid,
	"requested_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" varchar(50) PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "currencies" (
	"code" varchar(3) PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"decimals" integer DEFAULT 2 NOT NULL,
	"is_live" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "default_currency" varchar(10) DEFAULT 'SAR' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "payment_handle" text;--> statement-breakpoint
ALTER TABLE "group_invitations" ADD COLUMN "max_uses" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "group_invitations" ADD COLUMN "use_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "group_invitations" ADD COLUMN "is_revoked" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "groups" ADD COLUMN "status" varchar(20) DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "rejection_reason" varchar(100);--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "rejection_note" text;--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "idempotency_key" varchar(128);--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "requested_by" uuid;--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "decided_by" uuid;--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "decided_at" timestamp;--> statement-breakpoint
ALTER TABLE "settlements" ADD COLUMN "escalated_to_admin_at" timestamp;--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_creditor_id_users_id_fk" FOREIGN KEY ("creditor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_debtor_id_users_id_fk" FOREIGN KEY ("debtor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_requested_by_users_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_decided_by_users_id_fk" FOREIGN KEY ("decided_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "settlements" ADD CONSTRAINT "settlements_idempotency_key_unique" UNIQUE("idempotency_key");