CREATE TABLE "article_calculations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"article_id" uuid NOT NULL,
	"article_calculation_item_id" uuid NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "article_calculations" ADD CONSTRAINT "article_calculations_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "article_calculations" ADD CONSTRAINT "article_calculations_article_calculation_item_id_article_calculation_item_id_fk" FOREIGN KEY ("article_calculation_item_id") REFERENCES "public"."article_calculation_item"("id") ON DELETE no action ON UPDATE no action;