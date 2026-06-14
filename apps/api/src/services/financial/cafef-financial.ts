import type { FinancialData } from "@truestock/types";
import {
  fetchCompanyIntro,
  fetchCurrentIndicators,
  fetchFinanceReport,
  fetchRatioHistory,
  getIndicatorValue,
  getMetric,
  toTyVnd,
} from "./cafef-api";

function getRatioFromHistory(
  ratios: Awaited<ReturnType<typeof fetchRatioHistory>>,
  code: string,
  year: number
): number | null {
  if (!ratios?.Value?.length) return null;
  const period = ratios.Value.find((item) => item.Year === year) ?? ratios.Value[0];
  const metric = period?.Value.find((item) => item.Code === code);
  if (!metric) return null;
  const value = typeof metric.Value === "number" ? metric.Value : Number(metric.Value);
  return Number.isFinite(value) ? value : null;
}

// Lấy BCTC thật từ CafeF và map sang FinancialData
export async function fetchFinancialDataFromCafeF(
  ticker: string
): Promise<FinancialData | null> {
  const symbol = ticker.toUpperCase();
  const endYear = new Date().getFullYear();

  const [company, income, balance, ratios, indicators] = await Promise.all([
    fetchCompanyIntro(symbol),
    fetchFinanceReport(symbol, 1, endYear),
    fetchFinanceReport(symbol, 2, endYear),
    fetchRatioHistory(symbol, endYear),
    fetchCurrentIndicators(symbol),
  ]);

  if (!income?.Value?.length || !balance?.Value?.length) {
    return null;
  }

  const incomePeriods = income.Value.filter(
    (period) => getMetric(period, "DTTBHCCDV") != null
  );

  if (incomePeriods.length === 0) return null;

  const balanceByYear = new Map(
    balance.Value.map((period) => [period.Year, period])
  );

  const revenue = incomePeriods.map((period) => ({
    year: period.Year,
    value: toTyVnd(getMetric(period, "DTTBHCCDV") ?? 0),
  }));

  const netProfit = incomePeriods.map((period) => ({
    year: period.Year,
    value: toTyVnd(getMetric(period, "LNSTTNDN") ?? 0),
  }));

  const latestIncome = incomePeriods[0];
  const latestBalance =
    balanceByYear.get(latestIncome.Year) ?? balance.Value[0];

  const revLatest = getMetric(latestIncome, "DTTBHCCDV") ?? 0;
  const profitLatest = getMetric(latestIncome, "LNSTTNDN") ?? 0;
  const totalDebtVnd = getMetric(latestBalance, "TotalDebt") ?? 0;
  const totalEquityVnd = getMetric(latestBalance, "TotalOwnerCapital") ?? 0;

  let revenueGrowthYoY = 0;
  if (incomePeriods.length >= 2) {
    const revCurrent = getMetric(incomePeriods[0], "DTTBHCCDV") ?? 0;
    const revPrevious = getMetric(incomePeriods[1], "DTTBHCCDV") ?? 0;
    if (revPrevious > 0) {
      revenueGrowthYoY = ((revCurrent - revPrevious) / revPrevious) * 100;
    }
  }

  const netProfitMargin = revLatest > 0 ? (profitLatest / revLatest) * 100 : 0;
  const debtToEquity =
    totalEquityVnd > 0 ? totalDebtVnd / totalEquityVnd : 0;

  const peRatio =
    getIndicatorValue(indicators, "P/E") ??
    getRatioFromHistory(ratios, "PE", latestIncome.Year) ??
    0;

  const roe =
    getRatioFromHistory(ratios, "ROE", latestIncome.Year) ??
    getIndicatorValue(indicators, "ROE") ??
    0;

  return {
    ticker: symbol,
    companyName: company?.Name ?? `${symbol} Corporation`,
    revenue,
    netProfit,
    netProfitMargin: Math.round(netProfitMargin * 10) / 10,
    totalDebt: toTyVnd(totalDebtVnd),
    totalEquity: toTyVnd(totalEquityVnd),
    debtToEquity: Math.round(debtToEquity * 100) / 100,
    revenueGrowthYoY: Math.round(revenueGrowthYoY * 10) / 10,
    peRatio: Math.round(peRatio * 10) / 10,
    roe: Math.round(roe * 10) / 10,
    dataSource: "CafeF",
  };
}
