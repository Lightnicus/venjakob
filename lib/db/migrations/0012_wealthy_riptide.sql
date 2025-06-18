ALTER TABLE "articles" ADD COLUMN "blocked" timestamp;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "blocked_by" uuid;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "blocked" timestamp;--> statement-breakpoint
ALTER TABLE "blocks" ADD COLUMN "blocked_by" uuid;--> statement-breakpoint
ALTER TABLE "articles" ADD CONSTRAINT "articles_blocked_by_users_id_fk" FOREIGN KEY ("blocked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocks" ADD CONSTRAINT "blocks_blocked_by_users_id_fk" FOREIGN KEY ("blocked_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;