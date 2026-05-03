DROP INDEX "text_search_idx";--> statement-breakpoint
CREATE INDEX "text_search_idx" ON "policy_chunks" USING gin (to_tsvector('simple', "content"));