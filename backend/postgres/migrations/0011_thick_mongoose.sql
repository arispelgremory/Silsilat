CREATE TABLE "main"."fungible_token" (
	"token_id" varchar(40) NOT NULL,
	"transaction_id" varchar(40) NOT NULL,
	"status" varchar(20) NOT NULL,
	"amount" varchar(40) NOT NULL,
	"expired_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" varchar(40) NOT NULL,
	"updated_by" varchar(40) NOT NULL
);
