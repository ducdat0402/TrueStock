import { Hono } from "hono";
import type { Env, Variables } from "../../types/env";
import { requireAuth } from "../../middleware/clerk-auth";
import { requirePlan } from "../../middleware/plan-guard";
import { CompareService } from "./compare.service";

const MIN_TICKERS = 2;
const MAX_TICKERS_FREE = 0;
const MAX_TICKERS_PREMIUM = 5;

export const compareController = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/compare - compare multiple stocks (Premium only)
compareController.post(
  "/",
  requireAuth,
  requirePlan("premium", "b2b"),
  async (c) => {
    try {
      const body = await c.req.json<{ tickers?: string[] }>();
      const tickers = body.tickers;
      const userPlan = c.get("userPlan") || "free";
      const maxTickers = userPlan === "free" ? MAX_TICKERS_FREE : MAX_TICKERS_PREMIUM;

      // Validate input
      if (!tickers || !Array.isArray(tickers)) {
        return c.json(
          { success: false, error: "Vui lòng cung cấp danh sách mã cổ phiếu" },
          400
        );
      }

      // Filter and normalize
      const normalizedTickers = tickers
        .map((t) => (typeof t === "string" ? t.trim().toUpperCase() : ""))
        .filter((t) => t.length > 0);

      // Check count
      if (normalizedTickers.length < MIN_TICKERS) {
        return c.json(
          { success: false, error: `Cần ít nhất ${MIN_TICKERS} mã cổ phiếu để so sánh` },
          400
        );
      }

      if (normalizedTickers.length > maxTickers) {
        return c.json(
          { success: false, error: `Chỉ hỗ trợ tối đa ${maxTickers} mã cổ phiếu` },
          400
        );
      }

      // Check for duplicates
      const uniqueTickers = [...new Set(normalizedTickers)];
      if (uniqueTickers.length !== normalizedTickers.length) {
        return c.json(
          { success: false, error: "Không được nhập trùng mã cổ phiếu" },
          400
        );
      }

      const service = new CompareService(c.env);
      const result = await service.compare(uniqueTickers);

      return c.json({ success: true, data: result });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const status = message.includes("Không tìm thấy mã cổ phiếu") ? 400 : 500;
      return c.json({ success: false, error: message }, status);
    }
  }
);
