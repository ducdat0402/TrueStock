import type { AnalysisResult } from "@truestock/types";
import type { Env } from "../../types/env";
import { ClaudeService } from "../../services/ai/claude.service";
import { FinancialDataService } from "../../services/financial/financial-data.service";
import { HistoryService } from "../history/history.service";
import { AnalysisRepository } from "./analyze.repository";

export interface AnalyzeRequest {
  ticker: string;
  userId?: string;
}

export class AnalyzeService {
  private financialService: FinancialDataService;
  private repository: AnalysisRepository;
  private claudeService: ClaudeService;
  private historyService: HistoryService;

  constructor(env: Env) {
    this.financialService = new FinancialDataService();
    this.repository = new AnalysisRepository(env.DATABASE_URL);
    this.claudeService = new ClaudeService(env.ANTHROPIC_API_KEY);
    this.historyService = new HistoryService(env);
  }

  // POST /api/analyze — phân tích mới hoặc trả cache nếu còn hạn 24h
  async analyze(request: AnalyzeRequest): Promise<AnalysisResult> {
    const ticker = request.ticker.toUpperCase();

    const cached = await this.repository.findCachedRecord(ticker);
    if (cached && cached.result.dataSource !== "Mock Data") {
      await this.recordHistory(request.userId, ticker, cached.id);
      return cached.result;
    }

    const financialData = await this.financialService.fetch(ticker);
    const result = await this.claudeService.analyze(financialData);
    const saved = await this.repository.save(financialData, result);

    await this.recordHistory(request.userId, ticker, saved.id);

    return result;
  }

  // GET /api/analyze/:ticker — chỉ trả cache, không gọi Claude
  async getCached(ticker: string): Promise<AnalysisResult | null> {
    return this.repository.findCached(ticker.toUpperCase());
  }

  private async recordHistory(
    userId: string | undefined,
    ticker: string,
    analysisId: string
  ): Promise<void> {
    if (!userId) return;
    await this.historyService.recordSearch(userId, ticker, analysisId);
  }
}
