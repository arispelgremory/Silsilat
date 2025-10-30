ALTER TABLE "main"."token" ADD COLUMN "expired_at" timestamp;--> statement-breakpoint
ALTER TABLE "main"."sag" ADD COLUMN "cert_no" varchar(40);--> statement-breakpoint
ALTER TABLE "main"."sag" ADD CONSTRAINT "sag_cert_no_unique" UNIQUE("cert_no");