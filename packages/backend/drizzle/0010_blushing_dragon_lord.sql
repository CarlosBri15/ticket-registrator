ALTER TABLE "items" RENAME COLUMN "expense_type" TO "category_id";--> statement-breakpoint
ALTER TABLE "items" ALTER COLUMN "category_id" TYPE uuid USING NULL;--> statement-breakpoint
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;