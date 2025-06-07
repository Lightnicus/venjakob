ALTER TABLE "articles" ADD COLUMN "number" text NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "price" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "hide_title" boolean DEFAULT false NOT NULL;