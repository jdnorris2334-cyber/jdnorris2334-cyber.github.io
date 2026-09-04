import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
} from "drizzle-orm/pg-core";

// Players the user is actively tracking
export const watchlist = pgTable("watchlist", {
  id: serial().primaryKey(),
  pid: text("pid").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Individual card entries in the user's collection
export const collection = pgTable("collection", {
  id: serial().primaryKey(),
  pid: text("pid").notNull(),
  auto: boolean("auto").notNull().default(false),
  cardType: text("card_type").notNull().default("Chrome"),
  parallel: text("parallel").notNull().default(""),
  qty: integer("qty").notNull().default(1),
  pricePaid: numeric("price_paid", { precision: 10, scale: 2 }),
  grade: text("grade").notNull().default("RAW"),
  notes: text("notes").default(""),
  dateAdded: timestamp("date_added").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Historical eBay sold comps scraped per player
export const priceHistory = pgTable("price_history", {
  id: serial().primaryKey(),
  pid: text("pid").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  title: text("title"),
  soldDate: text("sold_date"),
  auto: boolean("auto").notNull().default(false),
  cardType: text("card_type").notNull().default("Chrome"),
  parallel: text("parallel").notNull().default(""),
  grade: text("grade").notNull().default("RAW"),
  year: text("year"),
  kept: boolean("kept").default(true),
  pulledAt: timestamp("pulled_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Roster moves / injury status pulled from MLB Stats API transactions, cached per watchlisted player
export const playerTransactions = pgTable("player_transactions", {
  id: serial().primaryKey(),
  pid: text("pid").notNull(),
  date: text("date"),
  typeCode: text("type_code"),
  typeDesc: text("type_desc"),
  description: text("description"),
  fromTeam: text("from_team"),
  toTeam: text("to_team"),
  pulledAt: timestamp("pulled_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recent per-game hitting lines pulled from MLB Stats API gameLog, cached per watchlisted player
export const playerGameLog = pgTable("player_game_log", {
  id: serial().primaryKey(),
  pid: text("pid").notNull(),
  date: text("date"),
  opponent: text("opponent"),
  team: text("team"),
  level: text("level"),
  ab: integer("ab"),
  r: integer("r"),
  h: integer("h"),
  doubles: integer("doubles"),
  triples: integer("triples"),
  hr: integer("hr"),
  rbi: integer("rbi"),
  sb: integer("sb"),
  bb: integer("bb"),
  k: integer("k"),
  pulledAt: timestamp("pulled_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
