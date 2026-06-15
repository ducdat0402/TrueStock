import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env } from "../../types/env";
import { requireApiKey, type ApiKeyVariables } from "../../middleware/api-key-auth";
import { B2BRepository } from "./b2b.repository";
import { ClaudeService } from "../../services/ai/claude.service";
import { FinancialDataService } from "../../services/financial/financial-data.service";
import { InsightsService } from "../../services/insights";
import { AnalysisRepository } from "../analyze/analyze.repository";

export const b2bController = new Hono<{
  Bindings: Env;
  Variables: ApiKeyVariables;
}>();

const analyzeSchema = z.object({
  ticker: z
    .string()
    .min(1, "Ticker is required")
    .max(10, "Ticker too long")
    .regex(/^[A-Za-z0-9]+$/, "Invalid ticker format"),
  brandName: z.string().optional(),
});

// POST /v1/analyze - B2B stock analysis endpoint
b2bController.post(
  "/analyze",
  requireApiKey,
  zValidator("json", analyzeSchema),
  async (c) => {
    const startTime = Date.now();
    const apiKeyId = c.get("apiKeyId");
    const orgName = c.get("orgName");
    const { ticker, brandName } = c.req.valid("json");

    const normalizedTicker = ticker.toUpperCase();
    const repo = new B2BRepository(c.env.DATABASE_URL);

    try {
      // Check cache first
      const analysisRepo = new AnalysisRepository(c.env.DATABASE_URL);
      const cached = await analysisRepo.findCachedRecord(normalizedTicker);

      if (cached && cached.result.dataSource !== "Mock Data") {
        // Log usage
        await repo.incrementUsage(
          apiKeyId,
          "/v1/analyze",
          normalizedTicker,
          Date.now() - startTime,
          200
        );

        return c.json({
          success: true,
          data: {
            ...cached.result,
            // White-label: replace brand name if provided
            dataSource: brandName || cached.result.dataSource,
            poweredBy: brandName ? undefined : "TrueStock API",
          },
          meta: {
            cached: true,
            responseTimeMs: Date.now() - startTime,
            orgName,
          },
        });
      }

      // Fetch fresh data
      const financialService = new FinancialDataService();
      const claudeService = new ClaudeService(c.env.ANTHROPIC_API_KEY);
      const insightsService = new InsightsService();

      const financialData = await financialService.fetch(normalizedTicker);
      const claudeResult = await claudeService.analyze(financialData);
      const enrichedResult = await insightsService.enrich(claudeResult, financialData);

      // Save to cache
      try {
        await analysisRepo.save(financialData, enrichedResult);
      } catch (error) {
        console.error("Cache save failed:", error);
      }

      // Log usage
      await repo.incrementUsage(
        apiKeyId,
        "/v1/analyze",
        normalizedTicker,
        Date.now() - startTime,
        200
      );

      return c.json({
        success: true,
        data: {
          ...enrichedResult,
          // White-label: replace brand name if provided
          dataSource: brandName || enrichedResult.dataSource,
          poweredBy: brandName ? undefined : "TrueStock API",
        },
        meta: {
          cached: false,
          responseTimeMs: Date.now() - startTime,
          orgName,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed";
      const status = message.includes("Không tìm thấy mã cổ phiếu") ? 400 : 500;

      // Log failed usage
      await repo.incrementUsage(
        apiKeyId,
        "/v1/analyze",
        normalizedTicker,
        Date.now() - startTime,
        status
      );

      return c.json(
        {
          success: false,
          error: message,
          meta: {
            responseTimeMs: Date.now() - startTime,
          },
        },
        status
      );
    }
  }
);

// GET /v1/usage - Get API usage stats
b2bController.get("/usage", requireApiKey, async (c) => {
  const apiKeyId = c.get("apiKeyId");
  const monthlyQuota = c.get("monthlyQuota");

  const repo = new B2BRepository(c.env.DATABASE_URL);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentUsage = await repo.getMonthlyUsage(apiKeyId, currentMonth);
  const history = await repo.getUsageStats(apiKeyId, 6);

  return c.json({
    success: true,
    data: {
      currentMonth: {
        period: currentMonth,
        used: currentUsage,
        limit: monthlyQuota,
        remaining: Math.max(0, monthlyQuota - currentUsage),
      },
      history,
    },
  });
});

// GET /v1/health - Health check for B2B API
b2bController.get("/health", async (c) => {
  return c.json({
    success: true,
    data: {
      status: "healthy",
      version: "1.0.0",
      timestamp: new Date().toISOString(),
    },
  });
});
