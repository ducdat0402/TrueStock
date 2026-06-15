import type { FinancialData } from "@truestock/types";

function formatYearlyData(items: { year: number; value: number }[]): string {
  return items
    .map((item) => `${item.year}: ${item.value.toLocaleString()} tỷ VND`)
    .join(", ");
}

function formatStockData(data: FinancialData): string {
  return `
### ${data.ticker} (${data.companyName})
- Doanh thu: ${formatYearlyData(data.revenue)}
- Lợi nhuận ròng: ${formatYearlyData(data.netProfit)}
- Biên lợi nhuận ròng: ${data.netProfitMargin}%
- Nợ/Vốn chủ sở hữu: ${data.debtToEquity}
- Tăng trưởng doanh thu: ${data.revenueGrowthYoY}%
- P/E: ${data.peRatio}
- ROE: ${data.roe}%`;
}

export function buildComparePrompt(stocks: FinancialData[]): string {
  const tickers = stocks.map((s) => s.ticker).join(", ");
  const stocksData = stocks.map(formatStockData).join("\n");

  return `You are a financial analyst helping a Vietnamese beginner investor (F0) compare stocks. Analyze and compare the following companies side by side. Respond ONLY in JSON format.

## Financial Data for ${tickers}
${stocksData}

Respond with this exact JSON structure (no markdown, no code blocks, just raw JSON):
{
  "stocks": [
    {
      "ticker": "ABC",
      "companyName": "Tên công ty",
      "healthScore": 7.5,
      "subScores": {
        "profitability": { "score": 8, "label": "Tốt", "color": "green" },
        "safety": { "score": 8, "label": "Tốt", "color": "green" },
        "growth": { "score": 7, "label": "Khá", "color": "yellow" },
        "valuation": { "score": 6, "label": "Hơi đắt", "color": "yellow" }
      },
      "highlights": ["Điểm mạnh 1", "Điểm mạnh hoặc yếu 2", "Điểm mạnh hoặc yếu 3"]
    }
  ],
  "recommendation": "Nhận xét tổng quan và gợi ý lựa chọn (2-3 câu tiếng Việt)",
  "bestFor": {
    "conservative": "Mã phù hợp nhà đầu tư thận trọng và lý do ngắn gọn",
    "growth": "Mã phù hợp nhà đầu tư ưu tiên tăng trưởng và lý do ngắn gọn",
    "dividend": "Mã phù hợp nhà đầu tư ưu tiên cổ tức (hoặc 'Không có mã nào nổi bật về cổ tức')"
  },
  "comparedAt": "${new Date().toISOString()}"
}

Rules:
- All text must be in Vietnamese, simple for F0 investors
- Include exactly ${stocks.length} stocks in the "stocks" array
- Each stock needs exactly 3 highlights (can be strengths or weaknesses)
- healthScore and subScores should be consistent per stock
- Be objective and balanced in comparisons
- If one stock is clearly better, say so, but explain why
- For "bestFor", recommend the most suitable stock for each investor type`;
}
