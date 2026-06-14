import { and, desc, eq, gte } from "drizzle-orm";
import type { AnalysisResult, FinancialData } from "@truestock/types";
import { getDb } from "../../db/client";
import { analyses, type Analysis } from "../../db/schema";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export class AnalysisRepository {
  constructor(private databaseUrl: string) {}

  private get db() {
    return getDb(this.databaseUrl);
  }

  // Tìm phân tích cached trong vòng 24 giờ
  async findCached(ticker: string): Promise<AnalysisResult | null> {
    const record = await this.findCachedRecord(ticker);
    return record?.result ?? null;
  }

  async findCachedRecord(
    ticker: string
  ): Promise<{ id: string; result: AnalysisResult } | null> {
    const cutoff = new Date(Date.now() - CACHE_TTL_MS);

    const rows = await this.db
      .select()
      .from(analyses)
      .where(and(eq(analyses.ticker, ticker.toUpperCase()), gte(analyses.createdAt, cutoff)))
      .orderBy(desc(analyses.createdAt))
      .limit(1);

    const row = rows[0];
    if (!row?.aiResult) return null;

    return { id: row.id, result: row.aiResult as AnalysisResult };
  }

  // Lưu kết quả phân tích mới
  async save(
    financialData: FinancialData,
    result: AnalysisResult
  ): Promise<Analysis> {
    const rows = await this.db
      .insert(analyses)
      .values({
        ticker: result.ticker.toUpperCase(),
        companyName: result.companyName,
        healthScore: String(result.healthScore),
        rawFinancialData: financialData,
        aiResult: result,
        updatedAt: new Date(),
      })
      .returning();

    return rows[0];
  }
}
