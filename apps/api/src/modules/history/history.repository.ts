import { desc, eq } from "drizzle-orm";
import type { SearchHistoryItem } from "@truestock/types";
import { getDb } from "../../db/client";
import { analyses, searchHistory } from "../../db/schema";

export class HistoryRepository {
  constructor(private databaseUrl: string) {}

  private get db() {
    return getDb(this.databaseUrl);
  }

  async saveSearch(
    userId: string,
    ticker: string,
    analysisId?: string
  ): Promise<void> {
    await this.db.insert(searchHistory).values({
      userId,
      ticker: ticker.toUpperCase(),
      analysisId: analysisId ?? null,
    });
  }

  async findByUserId(userId: string, limit = 20): Promise<SearchHistoryItem[]> {
    const rows = await this.db
      .select({
        id: searchHistory.id,
        ticker: searchHistory.ticker,
        searchedAt: searchHistory.searchedAt,
        companyName: analyses.companyName,
        healthScore: analyses.healthScore,
      })
      .from(searchHistory)
      .leftJoin(analyses, eq(searchHistory.analysisId, analyses.id))
      .where(eq(searchHistory.userId, userId))
      .orderBy(desc(searchHistory.searchedAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      ticker: row.ticker,
      companyName: row.companyName ?? undefined,
      healthScore: row.healthScore ? Number(row.healthScore) : undefined,
      searchedAt: row.searchedAt?.toISOString() ?? new Date().toISOString(),
    }));
  }
}
