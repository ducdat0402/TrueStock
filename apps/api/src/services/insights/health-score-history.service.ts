import type { FinancialData, HealthScoreHistoryItem } from "@truestock/types";
import {
  fetchQuarterlyFinanceReport,
  fetchQuarterlyRatioHistory,
  getMetric,
  toTyVnd,
  type CafeFReportPeriod,
  type CafeFRatioPeriod,
} from "../financial/cafef-api";
import { calculateHealthScore } from "../scoring/health-score.engine";

const MAX_QUARTERS = 4;

interface QuarterlyFinancialData {
  period: string;
  year: number;
  quarter: number;
  revenue: number;
  netProfit: number;
  netProfitMargin: number;
  totalDebt: number;
  totalEquity: number;
  debtToEquity: number;
  roe: number;
  peRatio: number;
}

function formatQuarterLabel(year: number, quarter: number): string {
  return `Q${quarter}/${year}`;
}

function extractQuarterlyData(
  incomeData: CafeFReportPeriod[],
  balanceData: CafeFReportPeriod[],
  ratioData: CafeFRatioPeriod[]
): QuarterlyFinancialData[] {
  const quarters: QuarterlyFinancialData[] = [];

  for (let i = 0; i < Math.min(incomeData.length, MAX_QUARTERS); i++) {
    const income = incomeData[i];
    const balance = balanceData.find(
      (b) => b.Year === income.Year && b.Quater === income.Quater
    );
    const ratio = ratioData.find(
      (r) => r.Year === income.Year && r.Quater === income.Quater
    );

    if (!income || !balance) continue;

    // Extract metrics (codes based on CafeF's API structure)
    const revenue = getMetric(income, "NetRevenue") ?? getMetric(income, "Revenue") ?? 0;
    const netProfit = getMetric(income, "NetProfit") ?? getMetric(income, "ProfitAfterTax") ?? 0;
    const totalDebt = getMetric(balance, "TotalLiabilities") ?? getMetric(balance, "Liability") ?? 0;
    const totalEquity = getMetric(balance, "Equity") ?? getMetric(balance, "TotalEquity") ?? 0;

    // Calculate metrics
    const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const debtToEquity = totalEquity > 0 ? totalDebt / totalEquity : 0;

    // Try to get ROE and P/E from ratio data, or calculate
    let roe = 0;
    let peRatio = 15; // default
    
    if (ratio) {
      const roeMetric = ratio.Value.find((v) => v.Code === "ROE");
      const peMetric = ratio.Value.find((v) => v.Code === "PE");
      if (roeMetric?.Value != null) {
        roe = typeof roeMetric.Value === "number" ? roeMetric.Value : Number(roeMetric.Value);
      }
      if (peMetric?.Value != null) {
        peRatio = typeof peMetric.Value === "number" ? peMetric.Value : Number(peMetric.Value);
      }
    }
    
    // Fallback: calculate ROE if not available
    if (!roe && totalEquity > 0) {
      roe = (netProfit / totalEquity) * 100;
    }

    quarters.push({
      period: formatQuarterLabel(income.Year, income.Quater),
      year: income.Year,
      quarter: income.Quater,
      revenue: toTyVnd(revenue),
      netProfit: toTyVnd(netProfit),
      netProfitMargin: Math.round(netProfitMargin * 10) / 10,
      totalDebt: toTyVnd(totalDebt),
      totalEquity: toTyVnd(totalEquity),
      debtToEquity: Math.round(debtToEquity * 100) / 100,
      roe: Math.round(roe * 10) / 10,
      peRatio: Math.round(peRatio * 10) / 10,
    });
  }

  return quarters;
}

function quarterlyToFinancialData(
  ticker: string,
  companyName: string,
  q: QuarterlyFinancialData
): FinancialData {
  return {
    ticker,
    companyName,
    revenue: [{ year: q.year, value: q.revenue }],
    netProfit: [{ year: q.year, value: q.netProfit }],
    netProfitMargin: q.netProfitMargin,
    totalDebt: q.totalDebt,
    totalEquity: q.totalEquity,
    debtToEquity: q.debtToEquity,
    revenueGrowthYoY: 0, // not applicable for quarterly
    peRatio: q.peRatio,
    roe: q.roe,
    dataSource: "CafeF",
  };
}

export async function calculateHealthScoreHistory(
  ticker: string,
  companyName: string
): Promise<HealthScoreHistoryItem[]> {
  const currentYear = new Date().getFullYear();

  try {
    // Fetch quarterly data in parallel
    const [incomeData, balanceData, ratioData] = await Promise.all([
      fetchQuarterlyFinanceReport(ticker, 1, currentYear, MAX_QUARTERS),
      fetchQuarterlyFinanceReport(ticker, 2, currentYear, MAX_QUARTERS),
      fetchQuarterlyRatioHistory(ticker, currentYear, MAX_QUARTERS),
    ]);

    if (!incomeData?.Value?.length || !balanceData?.Value?.length) {
      return [];
    }

    // Extract and merge quarterly data
    const quarters = extractQuarterlyData(
      incomeData.Value,
      balanceData.Value,
      ratioData?.Value ?? []
    );

    if (quarters.length === 0) return [];

    // Calculate health score for each quarter
    const history: HealthScoreHistoryItem[] = quarters.map((q) => {
      const financialData = quarterlyToFinancialData(ticker, companyName, q);
      const { healthScore } = calculateHealthScore(financialData);
      return {
        period: q.period,
        score: healthScore,
      };
    });

    // Return in chronological order (oldest first)
    return history.reverse();
  } catch {
    return [];
  }
}
