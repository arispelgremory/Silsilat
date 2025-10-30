ALTER TABLE "main"."sag" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "main"."sag" ADD COLUMN "closed_at" timestamp;