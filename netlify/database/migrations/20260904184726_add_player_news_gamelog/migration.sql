CREATE TABLE "player_game_log" (
	"id" serial PRIMARY KEY,
	"pid" text NOT NULL,
	"date" text,
	"opponent" text,
	"team" text,
	"level" text,
	"ab" integer,
	"r" integer,
	"h" integer,
	"doubles" integer,
	"triples" integer,
	"hr" integer,
	"rbi" integer,
	"sb" integer,
	"bb" integer,
	"k" integer,
	"pulled_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "player_transactions" (
	"id" serial PRIMARY KEY,
	"pid" text NOT NULL,
	"date" text,
	"type_code" text,
	"type_desc" text,
	"description" text,
	"from_team" text,
	"to_team" text,
	"pulled_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
