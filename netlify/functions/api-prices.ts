import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { priceHistory } from "../../db/schema.js";
import { eq, desc } from "drizzle-orm";

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
    const rows = pid
      ? await db.select().from(priceHistory).where(eq(priceHistory.pid, pid)).orderBy(desc(priceHistory.pulledAt))
      : await db.select().from(priceHistory).orderBy(desc(priceHistory.pulledAt)).limit(1000);
    return Response.json(rows, { headers: CORS });
  }

  if (req.method === "POST") {
    const body = await req.json();
    // Accept a single comp object or an array of comps
    const comps: Record<string, unknown>[] = Array.isArray(body) ? body : [body];
    if (comps.length === 0) {
      return Response.json({ error: "No comps provided" }, { status: 400, headers: CORS });
    }
    const rows = await db
      .insert(priceHistory)
      .values(
        comps.map((c) => ({
          pid: c.pid as string,
          price: String(c.price),
          title: c.title as string | undefined,
          soldDate: (c.soldDate ?? c.sold_date) as string | undefined,
          auto: (c.auto ?? false) as boolean,
          cardType: ((c.cardType ?? c.type) ?? "Chrome") as string,
          parallel: (c.parallel ?? "") as string,
          grade: (c.grade ?? "RAW") as string,
          year: (c.year ?? c.yr) as string | undefined,
          kept: (c.kept ?? true) as boolean,
        }))
      )
      .returning();
    return Response.json(rows, { status: 201, headers: CORS });
  }

  if (req.method === "PUT") {
    const id = url.searchParams.get("id");
    if (!id) {
      return Response.json({ error: "id query param required" }, { status: 400, headers: CORS });
    }
    const body = await req.json();
    const patch: Record<string, unknown> = {};
    if (body.price !== undefined) patch.price = String(body.price);
    if (body.title !== undefined) patch.title = body.title;
    if (body.soldDate !== undefined) patch.soldDate = body.soldDate;
    if (body.auto !== undefined) patch.auto = body.auto;
    if (body.cardType !== undefined || body.type !== undefined) patch.cardType = body.cardType ?? body.type;
    if (body.parallel !== undefined) patch.parallel = body.parallel;
    if (body.grade !== undefined) patch.grade = body.grade;
    if (body.year !== undefined || body.yr !== undefined) patch.year = body.year ?? body.yr;
    if (body.kept !== undefined) patch.kept = body.kept;
    const [updated] = await db
      .update(priceHistory)
      .set(patch)
      .where(eq(priceHistory.id, parseInt(id)))
      .returning();
    if (!updated) {
      return Response.json({ error: "Comp not found" }, { status: 404, headers: CORS });
    }
    return Response.json(updated, { headers: CORS });
  }

  if (req.method === "DELETE") {
    const id = url.searchParams.get("id");
    if (id) {
      await db.delete(priceHistory).where(eq(priceHistory.id, parseInt(id)));
      return new Response(null, { status: 204, headers: CORS });
    }
    const pid = url.searchParams.get("pid");
    if (!pid) {
      return Response.json({ error: "id or pid query param required" }, { status: 400, headers: CORS });
    }
    await db.delete(priceHistory).where(eq(priceHistory.pid, pid));
    return new Response(null, { status: 204, headers: CORS });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS });
};

export const config: Config = { path: "/api/prices" };
