import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env, Variables } from "../../types/env";
import { optionalAuth } from "../../middleware/clerk-auth";
import { AnalyzeService } from "./analyze.service";

const analyze = new Hono<{ Bindings: Env; Variables: Variables }>();

const analyzeSchema = z.object({
  ticker: z
    .string()
    .min(1, "Ticker is required")
    .max(10, "Ticker too long")
    .regex(/^[A-Za-z0-9]+$/, "Invalid ticker format"),
});

analyze.post("/", optionalAuth, zValidator("json", analyzeSchema), async (c) => {
  try {
    const { ticker } = c.req.valid("json");
    const service = new AnalyzeService(c.env);
    const result = await service.analyze({
      ticker,
      userId: c.get("userId"),
    });

    return c.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const status = message.includes("Không tìm thấy mã cổ phiếu") ? 400 : 500;
    return c.json({ success: false, error: message }, status);
  }
});

analyze.get("/:ticker", async (c) => {
  try {
    const ticker = c.req.param("ticker");
    const service = new AnalyzeService(c.env);
    const result = await service.getCached(ticker);

    if (!result) {
      return c.json(
        {
          success: false,
          error: `Chưa có phân tích cho mã ${ticker.toUpperCase()}. Hãy dùng POST /api/analyze để phân tích.`,
        },
        404
      );
    }

    return c.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return c.json({ success: false, error: message }, 500);
  }
});

export { analyze };
