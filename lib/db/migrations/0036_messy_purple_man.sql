-- Clean up existing duplicate block content entries before adding constraint
-- Keep only the most recent entry for each block-language combination
DELETE FROM block_content 
WHERE id NOT IN (
  SELECT DISTINCT ON (block_id, language_id) id 
  FROM block_content 
  WHERE deleted = false 
  ORDER BY block_id, language_id, updated_at DESC
);

DROP INDEX "idx_article_calculation_items_order";--> statement-breakpoint
DROP INDEX "idx_article_calculation_items_article_deleted_order";--> statement-breakpoint
ALTER TABLE "block_content" ADD CONSTRAINT "block_content_block_language_unique" UNIQUE("block_id","language_id");