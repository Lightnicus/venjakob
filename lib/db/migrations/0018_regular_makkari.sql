CREATE TYPE "public"."audit_action" AS ENUM('INSERT', 'UPDATE', 'DELETE');--> statement-breakpoint
CREATE TABLE "change_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"action" "audit_action" NOT NULL,
	"changed_fields" jsonb,
	"user_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "change_history" ADD CONSTRAINT "change_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "change_history_entity_idx" ON "change_history" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "change_history_user_idx" ON "change_history" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "change_history_timestamp_idx" ON "change_history" USING btree ("timestamp");