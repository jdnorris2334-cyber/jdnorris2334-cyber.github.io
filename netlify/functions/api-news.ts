import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { playerTransactions, playerGameLog } from "../../db/schema.js";
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

  const url = new URL(req.url);

  if (req.method === "GET") {
    const pid = url.searchParams.get("pid");
    if (!pid) {
      return Response.json({ error: "pid query param required" }, { status: 400, headers: CORS });
    }
    const [transactions, gameLog] = await Promise.all([
      db.select().from(playerTransactions).where(eq(playerTransactions.pid, pid)),
      db.select().from(playerGameLog).where(eq(playerGameLog.pid, pid)),
    ]);
    return Response.json({ transactions, gameLog }, { headers: CORS });
  }

  if (req.method === "POST") {
    const { pid, transactions, gameLog } = await req.json();
    if (!pid) {
      return Response.json({ error: "pid required" }, { status: 400, headers: CORS });
    }
    // Refresh replaces this player's cached news/game-log with the freshly pulled set.
    await db.delete(playerTransactions).where(eq(playerTransactions.pid, pid));
    await db.delete(playerGameLog).where(eq(playerGameLog.pid, pid));

    const txRows = Array.isArray(transactions) && transactions.length
      ? await db
          .insert(playerTransactions)
          .values(
            transactions.map((t: Record<string, unknown>) => ({
              pid,
              date: t.date as string | undefined,
              typeCode: t.typeCode as string | undefined,
              typeDesc: t.typeDesc as string | undefined,
              description: t.description as string | undefined,
              fromTeam: t.fromTeam as string | undefined,
              toTeam: t.toTeam as string | undefined,
            }))
          )
          .returning()
      : [];

    const gameRows = Array.isArray(gameLog) && gameLog.length
      ? await db
          .insert(playerGameLog)
          .values(
            gameLog.map((g: Record<string, unknown>) => ({
              pid,
              date: g.date as string | undefined,
              opponent: g.opponent as string | undefined,
              team: g.team as string | undefined,
              level: g.level as string | undefined,
              ab: g.ab as number | undefined,
              r: g.r as number | undefined,
              h: g.h as number | undefined,
              doubles: g.doubles as number | undefined,
              triples: g.triples as number | undefined,
              hr: g.hr as number | undefined,
              rbi: g.rbi as number | undefined,
              sb: g.sb as number | undefined,
              bb: g.bb as number | undefined,
              k: g.k as number | undefined,
            }))
          )
          .returning()
      : [];

    return Response.json({ transactions: txRows, gameLog: gameRows }, { status: 201, headers: CORS });
  }

  if (req.method === "DELETE") {
    const pid = url.searchParams.get("pid");
    if (!pid) {
      return Response.json({ error: "pid query param required" }, { status: 400, headers: CORS });
    }
    await db.delete(playerTransactions).where(eq(playerTransactions.pid, pid));
    await db.delete(playerGameLog).where(eq(playerGameLog.pid, pid));
    return new Response(null, { status: 204, headers: CORS });
  }

  return Response.json({ error: "Method not allowed" }, { status: 405, headers: CORS });
};

export const config: Config = { path: "/api/news" };
