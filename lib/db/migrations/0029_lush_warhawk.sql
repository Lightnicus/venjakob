ALTER TABLE "quote_positions" DROP CONSTRAINT "version_position_unique";--> statement-breakpoint
ALTER TABLE "quote_positions" ALTER COLUMN "position_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "quote_positions" ADD CONSTRAINT "version_position_unique" UNIQUE("version_id","quote_position_parent_id","position_number","deleted");