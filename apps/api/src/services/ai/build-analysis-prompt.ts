import type { FinancialData } from "@truestock/types";

function formatBillions(value: number): string {
  return `${(value / 1000).toFixed(1)} nghìn tỷ VND (${value} tỷ VND)`;
}

function formatYearlyData(items: { year: number; value: number }[]): string {
  return items.map((item) => `${item.year}: ${item.value.toLocaleString()} tỷ VND`).join(", ");
}

// Tạo prompt phân tích cho Claude dựa trên dữ liệu tài chính
export function buildAnalysisPrompt(financialData: FinancialData): string {
  const { ticker, companyName } = financialData;

  return `You are a financial analyst explaining stock analysis to a Vietnamese beginner investor (F0) who has no finance background. Analyze the following financial data and respond ONLY in JSON format.

Financial data for ${ticker} (${companyName}):
- Revenue (last 3 years): ${formatYearlyData(financialData.revenue)}
- Net profit (last 3 years): ${formatYearlyData(financialData.netProfit)}
- Net profit margin: ${financialData.netProfitMargin}%
- Total debt: ${formatBillions(financialData.totalDebt)}
- Total equity: ${formatBillions(financialData.totalEquity)}
- Debt-to-equity ratio: ${financialData.debtToEquity}
- Revenue growth YoY: ${financialData.revenueGrowthYoY}%
- P/E ratio: ${financialData.peRatio}
- ROE: ${financialData.roe}%

Respond with this exact JSON structure (no markdown, no code blocks, just raw JSON):
{
  "ticker": "${ticker}",
  "companyName": "${companyName}",
  "healthScore": 7.5,
  "subScores": {
    "profitability": { "score": 8, "label": "Tốt", "color": "green" },
    "safety": { "score": 8, "label": "Tốt", "color": "green" },
    "growth": { "score": 7, "label": "Khá", "color": "yellow" },
    "valuation": { "score": 6, "label": "Hơi đắt", "color": "yellow" }
  },
  "plainAnswers": {
    "isProfitable": "Giải thích bằng tiếng Việt, dễ hiểu, không thuật ngữ chuyên môn",
    "isDebtSafe": "Giải thích bằng tiếng Việt, dễ hiểu, không thuật ngữ chuyên môn",
    "isGrowing": "Giải thích bằng tiếng Việt, dễ hiểu, không thuật ngữ chuyên môn",
    "isPriceReasonable": "Giải thích bằng tiếng Việt, dễ hiểu, không thuật ngữ chuyên môn",
    "suitableFor": "Giải thích bằng tiếng Việt, dễ hiểu, không thuật ngữ chuyên môn"
  },
  "summary": "Tóm tắt 2-3 câu bằng tiếng Việt",
  "dataSource": "${financialData.dataSource}",
  "analyzedAt": "${new Date().toISOString()}"
}

Rules:
- All text content must be in Vietnamese
- healthScore is a number from 1 to 10 (can use decimals like 7.5)
- subScores.score is integer 1-10
- subScores.color must be exactly "green", "yellow", or "red"
- subScores.label examples: "Tốt", "Khá", "Trung bình", "Yếu", "Hơi đắt", "Rẻ"
- Be honest about weaknesses, don't oversell
- Use simple analogies F0 investors can understand`;
}
