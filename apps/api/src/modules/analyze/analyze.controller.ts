import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import type { Env, Variables } from "../../types/env";
import { requireAuth } from "../../middleware/clerk-auth";
import { AnalyzeService, QuotaExceededError } from "./analyze.service";

const analyze = new Hono<{ Bindings: Env; Variables: Variables }>();

const analyzeSchema = z.object({
  ticker: z
    .string()
    .min(1, "Ticker is required")
    .max(10, "Ticker too long")
    .regex(/^[A-Za-z0-9]+$/, "Invalid ticker format"),
});

analyze.post("/", requireAuth, zValidator("json", analyzeSchema), async (c) => {
  try {
    const { ticker } = c.req.valid("json");
    const service = new AnalyzeService(c.env);
    const { result, fromCache } = await service.analyze({
      ticker,
      userId: c.get("userId"),
      userPlan: c.get("userPlan"),
    });

    return c.json({ success: true, data: result, fromCache });
  } catch (error) {
    if (error instanceof QuotaExceededError) {
      return c.json(
        {
          success: false,
          error: `Bạn đã hết ${error.limit} lượt phân tích miễn phí hôm nay. Nâng cấp Premium để không giới hạn.`,
          code: "QUOTA_EXCEEDED",
          quota: {
            used: error.used,
            limit: error.limit,
            remaining: 0,
            plan: error.plan,
          },
        },
        403
      );
    }
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
