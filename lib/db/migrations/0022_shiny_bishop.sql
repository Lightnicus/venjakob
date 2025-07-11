ALTER TABLE "quote_positions" DROP CONSTRAINT "original_article_or_block_check";--> statement-breakpoint
ALTER TABLE "quote_positions" DROP CONSTRAINT "quote_positions_original_article_id_articles_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_positions" DROP CONSTRAINT "quote_positions_original_block_id_blocks_id_fk";
--> statement-breakpoint
ALTER TABLE "quote_positions" DROP COLUMN "original_article_id";--> statement-breakpoint
ALTER TABLE "quote_positions" DROP COLUMN "original_block_id";