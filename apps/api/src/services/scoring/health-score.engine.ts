import type { FinancialData, SubScore, SubScores } from "@truestock/types";

interface ScoringResult {
  healthScore: number;
  subScores: SubScores;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreToLabel(score: number): { label: string; color: SubScore["color"] } {
  if (score >= 8) return { label: "Rất tốt", color: "green" };
  if (score >= 7) return { label: "Tốt", color: "green" };
  if (score >= 5) return { label: "Trung bình", color: "yellow" };
  if (score >= 3) return { label: "Yếu", color: "red" };
  return { label: "Rất yếu", color: "red" };
}

function scoreProfitability(data: FinancialData): SubScore {
  let score = 5;

  // Net profit margin: >15% excellent, 10-15% good, 5-10% average, <5% poor
  if (data.netProfitMargin >= 15) score += 3;
  else if (data.netProfitMargin >= 10) score += 2;
  else if (data.netProfitMargin >= 5) score += 1;
  else if (data.netProfitMargin < 0) score -= 3;
  else score -= 1;

  // ROE: >20% excellent, 15-20% good, 10-15% average
  if (data.roe >= 20) score += 2;
  else if (data.roe >= 15) score += 1;
  else if (data.roe < 10) score -= 1;

  const finalScore = clamp(Math.round(score), 1, 10);
  return { score: finalScore, ...scoreToLabel(finalScore) };
}

function scoreSafety(data: FinancialData): SubScore {
  let score = 5;

  // Debt to equity: <0.5 excellent, 0.5-1 good, 1-1.5 average, >1.5 risky
  if (data.debtToEquity < 0.5) score += 3;
  else if (data.debtToEquity < 1) score += 1;
  else if (data.debtToEquity < 1.5) score -= 1;
  else score -= 3;

  // Check if equity is positive
  if (data.totalEquity <= 0) score -= 3;

  const finalScore = clamp(Math.round(score), 1, 10);
  return { score: finalScore, ...scoreToLabel(finalScore) };
}

function scoreGrowth(data: FinancialData): SubScore {
  let score = 5;

  // Revenue growth YoY: >20% excellent, 10-20% good, 0-10% average, <0 poor
  if (data.revenueGrowthYoY >= 20) score += 3;
  else if (data.revenueGrowthYoY >= 10) score += 2;
  else if (data.revenueGrowthYoY >= 0) score += 0;
  else if (data.revenueGrowthYoY >= -10) score -= 1;
  else score -= 3;

  // Check profit trend from revenue array
  if (data.netProfit.length >= 2) {
    const latest = data.netProfit[0].value;
    const previous = data.netProfit[1].value;
    if (latest > previous) score += 1;
    else if (latest < previous * 0.9) score -= 1;
  }

  const finalScore = clamp(Math.round(score), 1, 10);
  return { score: finalScore, ...scoreToLabel(finalScore) };
}

function scoreValuation(data: FinancialData): SubScore {
  let score = 5;

  // P/E ratio: <10 cheap, 10-15 reasonable, 15-25 average, >25 expensive
  if (data.peRatio <= 0) {
    score -= 2; // Negative P/E means losses
  } else if (data.peRatio < 10) {
    score += 3;
  } else if (data.peRatio < 15) {
    score += 2;
  } else if (data.peRatio < 25) {
    score += 0;
  } else if (data.peRatio < 40) {
    score -= 1;
  } else {
    score -= 2;
  }

  const finalScore = clamp(Math.round(score), 1, 10);
  
  // Custom labels for valuation
  let label: string;
  let color: SubScore["color"];
  if (finalScore >= 8) {
    label = "Rẻ";
    color = "green";
  } else if (finalScore >= 6) {
    label = "Hợp lý";
    color = "green";
  } else if (finalScore >= 4) {
    label = "Hơi đắt";
    color = "yellow";
  } else {
    label = "Đắt";
    color = "red";
  }

  return { score: finalScore, label, color };
}

export function calculateHealthScore(data: FinancialData): ScoringResult {
  const subScores: SubScores = {
    profitability: scoreProfitability(data),
    safety: scoreSafety(data),
    growth: scoreGrowth(data),
    valuation: scoreValuation(data),
  };

  // Weighted average: profitability 30%, safety 25%, growth 25%, valuation 20%
  const healthScore =
    subScores.profitability.score * 0.3 +
    subScores.safety.score * 0.25 +
    subScores.growth.score * 0.25 +
    subScores.valuation.score * 0.2;

  return {
    healthScore: Math.round(healthScore * 10) / 10,
    subScores,
  };
}
