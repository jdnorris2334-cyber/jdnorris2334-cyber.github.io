import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { watchlist } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method === "GET") {
    const players = await db.select().from(watchlist);
    return Response.json(players, { headers: CORS });
  }

  if (req.method === "POST") {
    const { pid, name } = await req.json();
    if (!pid || !name) {
      return Response.json({ error: "pid and name are required" }, { status: 400, headers: CORS });
    }
    const [player] = await db
      .insert(watchlist)
      .values({ pid, name })
      .onConflictDoUpdate({ target: watchlist.pid, set: { name } })
      .returning();
    return Response.json(player, { status: 201, headers: CORS });
  }

  if (req.method === "DELETE") {
    const pid = new URL(req.url).searchParams.get("pid");
    if (!pid) {
      return Response.json({ error: "pid query param required" }, { status: 400, headers: CORS });
    }
    await db.delete(watchlist).where(eq(watchlist.pid, pid));
    return new Response(null, { status: 204, headers: CORS });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS });
};

export const config: Config = { path: "/api/watchlist" };
