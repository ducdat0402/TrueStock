import type { AnalysisResult } from "@truestock/types";
import type { Env, UserPlan } from "../../types/env";
import { ClaudeService } from "../../services/ai/claude.service";
import { FinancialDataService } from "../../services/financial/financial-data.service";
import { InsightsService } from "../../services/insights";
import { HistoryService } from "../history/history.service";
import { UsageRepository } from "../usage";
import { AnalysisRepository } from "./analyze.repository";
import { getQuotaLimit } from "../../middleware/plan-guard";

export interface AnalyzeRequest {
  ticker: string;
  userId?: string;
  userPlan?: UserPlan;
}

export interface AnalyzeResult {
  result: AnalysisResult;
  fromCache: boolean;
}

export class QuotaExceededError extends Error {
  constructor(
    public used: number,
    public limit: number,
    public plan: UserPlan
  ) {
    super("Quota exceeded");
    this.name = "QuotaExceededError";
  }
}

export class AnalyzeService {
  private financialService: FinancialDataService;
  private repository: AnalysisRepository;
  private claudeService: ClaudeService;
  private insightsService: InsightsService;
  private historyService: HistoryService;
  private usageRepo: UsageRepository;

  constructor(env: Env) {
    this.financialService = new FinancialDataService();
    this.repository = new AnalysisRepository(env.DATABASE_URL);
    this.claudeService = new ClaudeService(env.ANTHROPIC_API_KEY);
    this.insightsService = new InsightsService();
    this.historyService = new HistoryService(env);
    this.usageRepo = new UsageRepository(env.DATABASE_URL);
  }

  // POST /api/analyze — phân tích mới hoặc trả cache nếu còn hạn 24h
  async analyze(request: AnalyzeRequest): Promise<AnalyzeResult> {
    const ticker = request.ticker.toUpperCase();
    const userPlan = request.userPlan || "free";

    // Check cache first - cache hit doesn't count against quota
    const cached = await this.repository.findCachedRecord(ticker);
    const hasInsights = cached?.result.riskAlerts !== undefined;
    if (cached && cached.result.dataSource !== "Mock Data" && hasInsights) {
      await this.recordHistory(request.userId, ticker, cached.id);
      const result = this.applyPlanRestrictions(cached.result, userPlan);
      return { result, fromCache: true };
    }

    // Cache miss - check quota before calling Claude
    if (request.userId) {
      const limit = getQuotaLimit(userPlan, "analyze");
      if (limit !== Infinity) {
        const usage = await this.usageRepo.getUsageToday(request.userId);
        if (usage.analyzeCount >= limit) {
          throw new QuotaExceededError(usage.analyzeCount, limit, userPlan);
        }
      }
    }

    // Call Claude (this costs money)
    const financialData = await this.financialService.fetch(ticker);
    const claudeResult = await this.claudeService.analyze(financialData);
    
    // Enrich with rule-based insights (risk alerts, industry comparison, etc.)
    const enrichedResult = await this.insightsService.enrich(claudeResult, financialData);

    // Increment usage only after successful Claude call (cache miss)
    if (request.userId) {
      try {
        await this.usageRepo.incrementAnalyzeCount(request.userId);
      } catch (error) {
        console.error("Usage increment failed:", error);
      }
    }

    try {
      const saved = await this.repository.save(financialData, enrichedResult);
      await this.recordHistory(request.userId, ticker, saved.id);
    } catch (error) {
      console.error("Analysis cache save failed:", error);
    }

    // Apply plan restrictions before returning
    const result = this.applyPlanRestrictions(enrichedResult, userPlan);
    return { result, fromCache: false };
  }

  // Strip premium-only insights for free users
  private applyPlanRestrictions(result: AnalysisResult, plan: UserPlan): AnalysisResult {
    if (plan !== "free") {
      return result;
    }

    // Free users don't get advanced insights
    const { riskAlerts, industryComparison, healthScoreHistory, ...basicResult } = result;
    return basicResult as AnalysisResult;
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
