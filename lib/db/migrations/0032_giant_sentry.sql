ALTER TABLE "quote_versions" ADD COLUMN "pricing_show_unit_prices" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD COLUMN "pricing_calc_total" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD COLUMN "pricing_discount_percent" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD COLUMN "pricing_discount_value" numeric;--> statement-breakpoint
ALTER TABLE "quote_versions" ADD COLUMN "pricing_discount_amount" numeric;