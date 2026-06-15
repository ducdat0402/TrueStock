import type { ComparisonResult, ComparisonStock, FinancialData } from "@truestock/types";
import type { Env } from "../../types/env";
import { FinancialDataService } from "../../services/financial/financial-data.service";
import { buildComparePrompt } from "./build-compare-prompt";
import { CompareRepository } from "./compare.repository";

const CLAUDE_MODEL = "claude-sonnet-4-6";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
}

function extractJson(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) return codeBlockMatch[1].trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) return jsonMatch[0];

  return text.trim();
}

function validateColor(color: string): "green" | "yellow" | "red" {
  if (color === "green" || color === "yellow" || color === "red") return color;
  return "yellow";
}

function parseComparisonResult(raw: unknown): ComparisonResult {
  const data = raw as Record<string, unknown>;
  const rawStocks = data.stocks as Array<Record<string, unknown>>;

  const stocks: ComparisonStock[] = rawStocks.map((s) => {
    const subScores = s.subScores as Record<string, Record<string, unknown>>;
    return {
      ticker: String(s.ticker),
      companyName: String(s.companyName),
      healthScore: Number(s.healthScore),
      subScores: {
        profitability: {
          score: Number(subScores.profitability.score),
          label: String(subScores.profitability.label),
          color: validateColor(String(subScores.profitability.color)),
        },
        safety: {
          score: Number(subScores.safety.score),
          label: String(subScores.safety.label),
          color: validateColor(String(subScores.safety.color)),
        },
        growth: {
          score: Number(subScores.growth.score),
          label: String(subScores.growth.label),
          color: validateColor(String(subScores.growth.color)),
        },
        valuation: {
          score: Number(subScores.valuation.score),
          label: String(subScores.valuation.label),
          color: validateColor(String(subScores.valuation.color)),
        },
      },
      highlights: (s.highlights as string[]) || [],
    };
  });

  const bestFor = data.bestFor as Record<string, string>;

  return {
    stocks,
    recommendation: String(data.recommendation),
    bestFor: {
      conservative: String(bestFor.conservative),
      growth: String(bestFor.growth),
      dividend: String(bestFor.dividend),
    },
    comparedAt: String(data.comparedAt || new Date().toISOString()),
  };
}

export class CompareService {
  private financialService: FinancialDataService;
  private repository: CompareRepository;
  private apiKey: string;

  constructor(env: Env) {
    this.financialService = new FinancialDataService();
    this.repository = new CompareRepository(env.DATABASE_URL);
    this.apiKey = env.ANTHROPIC_API_KEY;
  }

  async compare(tickers: string[]): Promise<ComparisonResult> {
    // Normalize tickers
    const normalizedTickers = tickers.map((t) => t.toUpperCase());

    // Check cache first
    const cached = await this.repository.findCached(normalizedTickers);
    if (cached) {
      return cached;
    }

    // Fetch financial data for all stocks in parallel
    const financialDataPromises = normalizedTickers.map((ticker) =>
      this.financialService.fetch(ticker)
    );
    const financialDataResults = await Promise.all(financialDataPromises);

    // Call Claude for comparison
    const result = await this.callClaude(financialDataResults);

    // Save to cache
    await this.repository.save(normalizedTickers, result);

    return result;
  }

  private async callClaude(stocks: FinancialData[]): Promise<ComparisonResult> {
    const prompt = buildComparePrompt(stocks);

    const response = await fetch(CLAUDE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Claude API error (${response.status}): ${errorBody}`);
    }

    const result = (await response.json()) as ClaudeResponse;
    const textContent = result.content.find((block) => block.type === "text")?.text;

    if (!textContent) {
      throw new Error("Claude API returned empty response");
    }

    const jsonStr = extractJson(textContent);
    const parsed = JSON.parse(jsonStr) as unknown;

    return parseComparisonResult(parsed);
  }
}
