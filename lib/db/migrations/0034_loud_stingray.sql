CREATE INDEX "idx_article_calculation_items_article_deleted" ON "article_calculation_item" USING btree ("article_id","deleted");--> statement-breakpoint
CREATE INDEX "idx_articles_deleted_number" ON "articles" USING btree ("deleted","number");--> statement-breakpoint
CREATE INDEX "idx_articles_number" ON "articles" USING btree ("number");--> statement-breakpoint
CREATE INDEX "idx_block_content_article_language_deleted" ON "block_content" USING btree ("article_id","language_id","deleted");--> statement-breakpoint
CREATE INDEX "idx_block_content_article_block_deleted" ON "block_content" USING btree ("article_id","block_id","deleted");--> statement-breakpoint
CREATE INDEX "idx_languages_default" ON "languages" USING btree ("default");