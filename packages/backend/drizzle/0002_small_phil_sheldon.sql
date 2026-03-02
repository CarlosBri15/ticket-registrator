CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"company_id" uuid,
	"is_visible" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "role" TO "role_id";--> statement-breakpoint
ALTER TABLE "permissions" DROP CONSTRAINT "permissions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "name" varchar(150) NOT NULL;--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "description" varchar(255);--> statement-breakpoint
ALTER TABLE "permissions" ADD COLUMN "is_visible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "permissions";--> statement-breakpoint
ALTER TABLE "permissions" DROP COLUMN "is_active";--> statement-breakpoint
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_name_unique" UNIQUE("name");