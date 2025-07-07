ALTER TABLE "quote_positions" RENAME COLUMN "original_document_id" TO "original_article_id";--> statement-breakpoint
ALTER TABLE "block_content" DROP CONSTRAINT "block_content_block_id_blocks_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_positions" ADD COLUMN "original_block_id" uuid;--> statement-breakpoint
ALTER TABLE "block_content" ADD CONSTRAINT "block_content_block_id_blocks_id_fk" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_positions" ADD CONSTRAINT "quote_positions_original_article_id_articles_id_fk" FOREIGN KEY ("original_article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_positions" ADD CONSTRAINT "quote_positions_original_block_id_blocks_id_fk" FOREIGN KEY ("original_block_id") REFERENCES "public"."blocks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_positions" ADD CONSTRAINT "original_article_or_block_check" CHECK (("quote_positions"."original_article_id" IS NOT NULL AND "quote_positions"."original_block_id" IS NULL) OR ("quote_positions"."original_article_id" IS NULL AND "quote_positions"."original_block_id" IS NOT NULL));