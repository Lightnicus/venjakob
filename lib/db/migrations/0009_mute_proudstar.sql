ALTER TABLE "article_calculations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "article_calculations" CASCADE;--> statement-breakpoint
ALTER TABLE "article_calculation_item" ADD COLUMN "article_id" uuid;--> statement-breakpoint
ALTER TABLE "article_calculation_item" ADD COLUMN "order" integer;--> statement-breakpoint
ALTER TABLE "article_calculation_item" ADD CONSTRAINT "article_calculation_item_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;