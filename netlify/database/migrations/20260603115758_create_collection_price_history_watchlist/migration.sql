CREATE TABLE "collection" (
	"id" serial PRIMARY KEY,
	"pid" text NOT NULL,
	"auto" boolean DEFAULT false NOT NULL,
	"card_type" text DEFAULT 'Chrome' NOT NULL,
	"parallel" text DEFAULT '' NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"price_paid" numeric(10,2),
	"grade" text DEFAULT 'RAW' NOT NULL,
	"notes" text DEFAULT '',
	"date_added" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "price_history" (
	"id" serial PRIMARY KEY,
	"pid" text NOT NULL,
	"price" numeric(10,2) NOT NULL,
	"title" text,
	"sold_date" text,
	"auto" boolean DEFAULT false NOT NULL,
	"card_type" text DEFAULT 'Chrome' NOT NULL,
	"parallel" text DEFAULT '' NOT NULL,
	"grade" text DEFAULT 'RAW' NOT NULL,
	"year" text,
	"kept" boolean DEFAULT true,
	"pulled_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "watchlist" (
	"id" serial PRIMARY KEY,
	"pid" text NOT NULL UNIQUE,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
