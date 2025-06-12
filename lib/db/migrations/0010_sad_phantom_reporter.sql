ALTER TABLE "article_calculation_item" DROP CONSTRAINT "article_calculation_item_article_id_articles_id_fk";
--> statement-breakpoint
ALTER TABLE "block_content" DROP CONSTRAINT "block_content_article_id_articles_id_fk";
--> statement-breakpoint
ALTER TABLE "article_calculation_item" ADD CONSTRAINT "article_calculation_item_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_content" ADD CONSTRAINT "block_content_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;