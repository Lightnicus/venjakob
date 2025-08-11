ALTER TABLE "quote_positions" ADD COLUMN "is_option" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_positions" ADD COLUMN "page_break_above" boolean DEFAULT false NOT NULL;