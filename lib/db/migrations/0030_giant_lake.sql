CREATE TABLE "quote_position_calculation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quote_position_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "article_calculation_item_type" NOT NULL,
	"value" numeric NOT NULL,
	"order" integer,
	"source_article_calculation_item_id" uuid,
	"deleted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "quote_position_calculation_items" ADD CONSTRAINT "quote_position_calculation_items_quote_position_id_quote_positions_id_fk" FOREIGN KEY ("quote_position_id") REFERENCES "public"."quote_positions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quote_position_calculation_items" ADD CONSTRAINT "quote_position_calculation_items_source_article_calculation_item_id_article_calculation_item_id_fk" FOREIGN KEY ("source_article_calculation_item_id") REFERENCES "public"."article_calculation_item"("id") ON DELETE set null ON UPDATE no action;