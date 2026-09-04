import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { collection } from "../../db/schema.js";
import { eq } from "drizzle-orm";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  const url = new URL(req.url);

  if (req.method === "GET") {
    const pid = url.searchParams.get("pid");
    const cards = pid
      ? await db.select().from(collection).where(eq(collection.pid, pid))
      : await db.select().from(collection);
    return Response.json(cards, { headers: CORS });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { pid, auto = false, cardType = "Chrome", parallel = "", qty = 1, pricePaid, grade = "RAW", notes = "" } = body;
    if (!pid) {
      return Response.json({ error: "pid is required" }, { status: 400, headers: CORS });
    }
    const [card] = await db
      .insert(collection)
      .values({ pid, auto, cardType, parallel, qty, pricePaid, grade, notes })
      .returning();
    return Response.json(card, { status: 201, headers: CORS });
  }

  if (req.method === "PUT") {
    const id = url.searchParams.get("id");
    if (!id) {
      return Response.json({ error: "id query param required" }, { status: 400, headers: CORS });
    }
    const body = await req.json();
    const { auto, cardType, parallel, qty, pricePaid, grade, notes } = body;
    const [updated] = await db
      .update(collection)
      .set({ auto, cardType, parallel, qty, pricePaid, grade, notes })
      .where(eq(collection.id, parseInt(id)))
      .returning();
    if (!updated) {
      return Response.json({ error: "Card not found" }, { status: 404, headers: CORS });
    }
    return Response.json(updated, { headers: CORS });
  }

  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (!id) {
      return Response.json({ error: "id query param required" }, { status: 400, headers: CORS });
    }
    await db.delete(collection).where(eq(collection.id, parseInt(id)));
    return new Response(null, { status: 204, headers: CORS });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS });
};

export const config: Config = { path: "/api/collection" };
