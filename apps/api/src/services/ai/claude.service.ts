import type { AnalysisResult } from "@truestock/types";
import { buildAnalysisPrompt } from "./build-analysis-prompt";
import type { FinancialData } from "@truestock/types";

interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>;
}

const CLAUDE_MODEL = "claude-sonnet-4-6";
const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

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

function parseAnalysisResult(raw: unknown, fallbackSource: string): AnalysisResult {
  const data = raw as Record<string, unknown>;

  const subScores = data.subScores as Record<string, Record<string, unknown>>;
  const plainAnswers = data.plainAnswers as Record<string, string>;

  return {
    ticker: String(data.ticker),
    companyName: String(data.companyName),
    healthScore: Number(data.healthScore),
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
    plainAnswers: {
      isProfitable: plainAnswers.isProfitable,
      isDebtSafe: plainAnswers.isDebtSafe,
      isGrowing: plainAnswers.isGrowing,
      isPriceReasonable: plainAnswers.isPriceReasonable,
      suitableFor: plainAnswers.suitableFor,
    },
    summary: String(data.summary),
    dataSource: String(data.dataSource || fallbackSource),
    analyzedAt: String(data.analyzedAt || new Date().toISOString()),
  };
}

export class ClaudeService {
  constructor(private apiKey: string) {}

  async analyze(financialData: FinancialData): Promise<AnalysisResult> {
    const prompt = buildAnalysisPrompt(financialData);

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
        messages: [{ role: "user", content: prompt }] satisfies ClaudeMessage[],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (response.status === 403) {
        throw new Error(
          "Claude API từ chối yêu cầu (403). Có thể do vùng data center Cloudflare bị chặn — đang thử route lại."
        );
      }
      throw new Error(`Claude API error (${response.status}): ${errorBody}`);
    }

    const result = (await response.json()) as ClaudeResponse;
    const textContent = result.content.find((block) => block.type === "text")?.text;

    if (!textContent) {
      throw new Error("Claude API returned empty response");
    }

    const jsonStr = extractJson(textContent);
    const parsed = JSON.parse(jsonStr) as unknown;

    return parseAnalysisResult(parsed, financialData.dataSource);
  }
}
