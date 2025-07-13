-- Convert version_number from text to integer using proper casting
ALTER TABLE "quote_versions" ALTER COLUMN "version_number" SET DATA TYPE integer USING "version_number"::integer;--> statement-breakpoint

-- Add variant_number column with default value for existing records
ALTER TABLE "quote_variants" ADD COLUMN "variant_number" integer;--> statement-breakpoint

-- Update existing records: set variant_number to cast variant_descriptor to integer
UPDATE "quote_variants" SET "variant_number" = "variant_descriptor"::integer;--> statement-breakpoint

-- Make variant_number NOT NULL after updating existing records
ALTER TABLE "quote_variants" ALTER COLUMN "variant_number" SET NOT NULL;