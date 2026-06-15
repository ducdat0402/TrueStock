import { Hono } from "hono";
import type { Env, Variables } from "../../types/env";
import { requireAuth } from "../../middleware/clerk-auth";
import { getQuotaLimit } from "../../middleware/plan-guard";
import { UsageRepository } from "../usage";

export const meController = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/me - get current user info with plan and usage
meController.get("/", requireAuth, async (c) => {
  const userId = c.get("userId")!;
  const clerkId = c.get("clerkId")!;
  const userPlan = c.get("userPlan") || "free";

  const usageRepo = new UsageRepository(c.env.DATABASE_URL);
  const usage = await usageRepo.getUsageToday(userId);

  const analyzeLimitNum = getQuotaLimit(userPlan, "analyze");
  const compareLimitNum = getQuotaLimit(userPlan, "compare");

  const analyzeLimit = analyzeLimitNum === Infinity ? "unlimited" : analyzeLimitNum;
  const compareLimit = compareLimitNum === Infinity ? "unlimited" : compareLimitNum;

  return c.json({
    success: true,
    data: {
      userId,
      clerkId,
      plan: userPlan,
      usage: {
        analyze: {
          used: usage.analyzeCount,
          limit: analyzeLimit,
          remaining:
            analyzeLimitNum === Infinity
              ? "unlimited"
              : Math.max(0, analyzeLimitNum - usage.analyzeCount),
        },
        compare: {
          used: usage.compareCount,
          limit: compareLimit,
          remaining:
            compareLimitNum === Infinity
              ? "unlimited"
              : Math.max(0, compareLimitNum - usage.compareCount),
        },
      },
      features: {
        watchlist: userPlan !== "free",
        alerts: userPlan !== "free",
        insights: userPlan !== "free",
        compare: userPlan !== "free",
        maxCompareStocks: userPlan === "free" ? 0 : 5,
      },
    },
  });
});
