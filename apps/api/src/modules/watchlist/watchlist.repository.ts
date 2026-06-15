import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc } from "drizzle-orm";
import { watchlist } from "../../db/schema";
import type { WatchlistItem } from "@truestock/types";

export class WatchlistRepository {
  private db;

  constructor(databaseUrl: string) {
    const client = neon(databaseUrl);
    this.db = drizzle(client);
  }

  async findByUserId(userId: string): Promise<WatchlistItem[]> {
    const rows = await this.db
      .select({
        id: watchlist.id,
        ticker: watchlist.ticker,
        lastScore: watchlist.lastScore,
        lastCheckedAt: watchlist.lastCheckedAt,
        createdAt: watchlist.createdAt,
      })
      .from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.createdAt));

    return rows.map((row) => ({
      id: row.id,
      ticker: row.ticker,
      lastScore: row.lastScore ? Number(row.lastScore) : undefined,
      lastCheckedAt: row.lastCheckedAt?.toISOString(),
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    }));
  }

  async findByUserAndTicker(
    userId: string,
    ticker: string
  ): Promise<WatchlistItem | null> {
    const rows = await this.db
      .select({
        id: watchlist.id,
        ticker: watchlist.ticker,
        lastScore: watchlist.lastScore,
        lastCheckedAt: watchlist.lastCheckedAt,
        createdAt: watchlist.createdAt,
      })
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.ticker, ticker.toUpperCase())
        )
      )
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return {
      id: row.id,
      ticker: row.ticker,
      lastScore: row.lastScore ? Number(row.lastScore) : undefined,
      lastCheckedAt: row.lastCheckedAt?.toISOString(),
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async add(userId: string, ticker: string, score?: number): Promise<WatchlistItem> {
    const rows = await this.db
      .insert(watchlist)
      .values({
        userId,
        ticker: ticker.toUpperCase(),
        lastScore: score?.toString(),
        lastCheckedAt: new Date(),
      })
      .returning({
        id: watchlist.id,
        ticker: watchlist.ticker,
        lastScore: watchlist.lastScore,
        lastCheckedAt: watchlist.lastCheckedAt,
        createdAt: watchlist.createdAt,
      });

    const row = rows[0];
    return {
      id: row.id,
      ticker: row.ticker,
      lastScore: row.lastScore ? Number(row.lastScore) : undefined,
      lastCheckedAt: row.lastCheckedAt?.toISOString(),
      createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    };
  }

  async remove(userId: string, ticker: string): Promise<boolean> {
    const result = await this.db
      .delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.ticker, ticker.toUpperCase())
        )
      )
      .returning({ id: watchlist.id });

    return result.length > 0;
  }

  async updateScore(
    userId: string,
    ticker: string,
    score: number
  ): Promise<void> {
    await this.db
      .update(watchlist)
      .set({
        lastScore: score.toString(),
        lastCheckedAt: new Date(),
      })
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.ticker, ticker.toUpperCase())
        )
      );
  }
}
