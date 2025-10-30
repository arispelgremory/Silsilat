CREATE SCHEMA "main";
--> statement-breakpoint
CREATE TABLE "main"."company_admin" (
	"company_admin_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"company_admin_first_name" varchar(50) NOT NULL,
	"company_admin_last_name" varchar(50) NOT NULL,
	"company_admin_email" varchar(100) NOT NULL,
	"company_admin_contact_no" varchar(20) NOT NULL,
	"company_admin_password" varchar(100) NOT NULL,
	"company_id" varchar(40) NOT NULL,
	"bool_module" boolean NOT NULL,
	"module_access_id" varchar(40)[],
	"bool_permission" boolean NOT NULL,
	"role_id" varchar(40),
	"session_id" varchar(40),
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL,
	CONSTRAINT "company_admin_company_admin_email_unique" UNIQUE("company_admin_email")
);
--> statement-breakpoint
CREATE TABLE "main"."role_permission" (
	"permission_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"permission_name" varchar(50) NOT NULL,
	"policy" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."super_admin" (
	"super_admin_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"super_admin_nickname" varchar(50) NOT NULL,
	"super_admin_first_name" varchar(50) NOT NULL,
	"super_admin_last_name" varchar(50) NOT NULL,
	"super_admin_email" varchar(100) NOT NULL,
	"super_admin_contact_no" varchar(20) NOT NULL,
	"super_admin_password" varchar(100) NOT NULL,
	"bool_module" boolean NOT NULL,
	"module_access_id" varchar(40)[],
	"bool_permission" boolean NOT NULL,
	"role_id" varchar(40),
	"session_id" varchar(40),
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL,
	CONSTRAINT "super_admin_super_admin_email_unique" UNIQUE("super_admin_email")
);
--> statement-breakpoint
CREATE TABLE "main"."user" (
	"user_id" varchar(40) NOT NULL,
	"user_email" varchar(100) NOT NULL,
	"user_contact_no" varchar(20) NOT NULL,
	"user_password" varchar(100) NOT NULL,
	"ic_no" varchar(12) NOT NULL,
	"ic_front_picture" text NOT NULL,
	"ic_back_picture" text NOT NULL,
	"user_first_name" varchar(50) NOT NULL,
	"user_last_name" varchar(50) NOT NULL,
	"gender" varchar(10) NOT NULL,
	"account_id" varchar(40) NOT NULL,
	"address_id" varchar(40) NOT NULL,
	"company_id" varchar(40) NOT NULL,
	"vehicle_id" varchar(40),
	"wallet_id" varchar(40) NOT NULL,
	"user_skill_id" varchar(40),
	"job_review_id" varchar(40),
	"role_id" varchar(40),
	"session_id" varchar(40),
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL,
	CONSTRAINT "user_user_email_unique" UNIQUE("user_email"),
	CONSTRAINT "user_user_contact_no_unique" UNIQUE("user_contact_no")
);
--> statement-breakpoint
CREATE TABLE "main"."user_role" (
	"role_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"role_name" varchar(50) NOT NULL,
	"permission_id" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."hedera_account" (
	"account_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"hedera_account_id" varchar(20) NOT NULL,
	"account_name" varchar(100) NOT NULL,
	"public_key" text NOT NULL,
	"private_key" text,
	"account_type" varchar(20) NOT NULL,
	"balance" numeric(20, 8),
	"status" varchar(20) DEFAULT 'ACTIVE' NOT NULL,
	"is_operator" boolean DEFAULT false NOT NULL,
	"network" varchar(20) DEFAULT 'testnet' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL,
	CONSTRAINT "hedera_account_hedera_account_id_unique" UNIQUE("hedera_account_id")
);
--> statement-breakpoint
CREATE TABLE "main"."token" (
	"token_id" varchar(40) NOT NULL,
	"transaction_id" varchar(40) NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."permission" (
	"permission_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"permission_name" varchar(40) NOT NULL,
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."role" (
	"role_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"role_name" varchar(40) NOT NULL,
	"permission_id" varchar(40)[],
	"status" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "main"."sag" (
	"sag_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"sag_name" text NOT NULL,
	"sag_description" text DEFAULT '',
	"sag_properties" jsonb DEFAULT '{}'::jsonb,
	"sag_type" text DEFAULT 'Conventional'
);
