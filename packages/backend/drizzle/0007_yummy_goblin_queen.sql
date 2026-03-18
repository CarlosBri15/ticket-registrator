ALTER TABLE "reports" ALTER COLUMN "requested_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "reports" ALTER COLUMN "approved_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "converted_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "llm_suggested_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "tickets" ALTER COLUMN "approved_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "flag" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "llm_comment" varchar(500);--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "is_visible";--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "is_visible";--> statement-breakpoint
ALTER TABLE "roles" DROP COLUMN "is_visible";--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "is_visible";