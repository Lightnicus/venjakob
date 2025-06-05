CREATE TABLE "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"foreign_id" text NOT NULL,
	"name" text NOT NULL,
	"language_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clients_foreign_id_unique" UNIQUE("foreign_id")
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_language_id_languages_id_fk" FOREIGN KEY ("language_id") REFERENCES "public"."languages"("id") ON DELETE no action ON UPDATE no action;