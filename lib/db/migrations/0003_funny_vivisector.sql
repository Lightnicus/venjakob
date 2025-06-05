CREATE TABLE "blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"standard" boolean NOT NULL,
	"mandatory" boolean NOT NULL,
	"position" integer NOT NULL,
	"hide_title" boolean NOT NULL,
	"page_break_above" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
