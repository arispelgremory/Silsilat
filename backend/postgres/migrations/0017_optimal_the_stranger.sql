CREATE TABLE "main"."gold_price" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"price_per_gram_usd" numeric(10, 2) NOT NULL,
	"price_per_gram_myr" numeric(10, 2) NOT NULL,
	"exchange_rate" numeric(10, 4) NOT NULL,
	"source" varchar(50) DEFAULT 'manual' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
