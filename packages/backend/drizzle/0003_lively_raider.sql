ALTER TABLE "users" ALTER COLUMN "company_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "department_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "company_id" uuid;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "is_system" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "roles" ADD COLUMN "hierarchy" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;