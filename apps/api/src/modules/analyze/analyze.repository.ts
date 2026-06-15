import { and, desc, eq, gte } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";
import type { AnalysisResult, FinancialData } from "@truestock/types";
import { getDb } from "../../db/client";
import { analyses, type Analysis } from "../../db/schema";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function sanitizeForJson<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => {
      if (typeof v === "string") {
        return v.replace(/\u0000/g, "");
      }
      return v;
    })
  ) as T;
}

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
    const ticker = result.ticker.toUpperCase();
    const safeFinancialData = sanitizeForJson(financialData);
    const safeResult = sanitizeForJson(result);

    try {
      const sql = neon(this.databaseUrl);
      const rows = await sql`
        INSERT INTO analyses (
          ticker,
          company_name,
          health_score,
          raw_financial_data,
          ai_result,
          updated_at
        )
        VALUES (
          ${ticker},
          ${safeResult.companyName},
          ${String(safeResult.healthScore)},
          ${JSON.stringify(safeFinancialData)}::jsonb,
          ${JSON.stringify(safeResult)}::jsonb,
          NOW()
        )
        RETURNING
          id,
          ticker,
          company_name AS "companyName",
          health_score AS "healthScore",
          raw_financial_data AS "rawFinancialData",
          ai_result AS "aiResult",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `;

      return rows[0] as Analysis;
    } catch (error) {
      const cause =
        error instanceof Error && "cause" in error ? error.cause : undefined;
      const detail =
        cause instanceof Error
          ? cause.message
          : cause != null
            ? String(cause)
            : error instanceof Error
              ? error.message
              : "Unknown error";

      throw new Error(`Không thể lưu kết quả phân tích: ${detail}`);
    }
  }
}
