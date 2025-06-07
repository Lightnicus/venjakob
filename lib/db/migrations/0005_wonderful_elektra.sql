CREATE TYPE "public"."article_calculation_item_type" AS ENUM('time', 'cost');--> statement-breakpoint
CREATE TABLE "article_calculation_item" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"type" "article_calculation_item_type" NOT NULL,
	"value" numeric NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
