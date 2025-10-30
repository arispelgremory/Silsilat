ALTER TABLE "main"."hedera_account" ALTER COLUMN "balance" SET DATA TYPE numeric(20, 2);--> statement-breakpoint
ALTER TABLE "main"."user" DROP COLUMN "balance";