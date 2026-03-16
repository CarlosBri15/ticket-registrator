ALTER TABLE "permissions" DROP COLUMN "is_visible";--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "reports" DROP COLUMN "is_visible";--> statement-breakpoint
ALTER TABLE "reports" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "roles" DROP COLUMN "is_visible";--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "is_visible";--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "flag" boolean DEFAULT false NOT NULL;