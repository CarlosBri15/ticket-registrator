ALTER TABLE "users_to_roles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "users_to_roles" CASCADE;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "role_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;