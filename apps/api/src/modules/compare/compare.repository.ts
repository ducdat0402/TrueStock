import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { comparisons } from "../../db/schema";
import type { ComparisonResult } from "@truestock/types";

const CACHE_HOURS = 24;

export class CompareRepository {
  private db;

  constructor(databaseUrl: string) {
    const client = neon(databaseUrl);
    this.db = drizzle(client);
  }

  static buildTickerKey(tickers: string[]): string {
    return [...tickers].sort().map((t) => t.toUpperCase()).join("-");
  }

  async findCached(tickers: string[]): Promise<ComparisonResult | null> {
    const tickerKey = CompareRepository.buildTickerKey(tickers);

    const rows = await this.db
      .select()
      .from(comparisons)
      .where(
        sql`${comparisons.tickerKey} = ${tickerKey} 
            AND ${comparisons.createdAt} > NOW() - INTERVAL '${sql.raw(String(CACHE_HOURS))} hours'`
      )
      .limit(1);

    const row = rows[0];
    if (!row?.result) return null;

    return row.result as ComparisonResult;
  }

  async save(
    tickers: string[],
    result: ComparisonResult
  ): Promise<{ id: string }> {
    const tickerKey = CompareRepository.buildTickerKey(tickers);

    // Upsert: insert or update if exists
    const rows = await this.db
      .insert(comparisons)
      .values({
        tickerKey,
        result,
      })
      .onConflictDoUpdate({
        target: comparisons.tickerKey,
        set: {
          result,
          createdAt: sql`NOW()`,
        },
      })
      .returning({ id: comparisons.id });

    return { id: rows[0].id };
  }
}
