CREATE TABLE "articles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "block_content" ALTER COLUMN "block_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "block_content" ADD COLUMN "article_id" uuid;--> statement-breakpoint
ALTER TABLE "block_content" ADD CONSTRAINT "block_content_article_id_articles_id_fk" FOREIGN KEY ("article_id") REFERENCES "public"."articles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "block_content" ADD CONSTRAINT "block_or_article_check" CHECK (("block_content"."block_id" IS NOT NULL AND "block_content"."article_id" IS NULL) OR ("block_content"."block_id" IS NULL AND "block_content"."article_id" IS NOT NULL));