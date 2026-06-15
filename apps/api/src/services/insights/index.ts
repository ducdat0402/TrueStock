import type { AnalysisResult, FinancialData } from "@truestock/types";
import { detectRiskAlerts } from "./risk-alert.service";
import { calculateIndustryComparison } from "./industry-comparison.service";
import { calculateHealthScoreHistory } from "./health-score-history.service";

export class InsightsService {
  async enrich(
    result: AnalysisResult,
    financialData: FinancialData
  ): Promise<AnalysisResult> {
    // Phase 1A: Add risk alerts (sync, fast)
    const riskAlerts = detectRiskAlerts(financialData);

    // Phase 1B & 1C: Run industry comparison and health score history in parallel
    const [industryComparison, healthScoreHistory] = await Promise.all([
      calculateIndustryComparison(result.ticker, result.healthScore),
      calculateHealthScoreHistory(result.ticker, result.companyName),
    ]);

    return {
      ...result,
      riskAlerts: riskAlerts.length > 0 ? riskAlerts : undefined,
      industryComparison: industryComparison ?? undefined,
      healthScoreHistory:
        healthScoreHistory.length > 0 ? healthScoreHistory : undefined,
    };
  }
}

export { detectRiskAlerts } from "./risk-alert.service";
export { calculateIndustryComparison } from "./industry-comparison.service";
export { calculateHealthScoreHistory } from "./health-score-history.service";
