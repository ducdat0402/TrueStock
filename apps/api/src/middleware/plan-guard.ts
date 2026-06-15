import { createMiddleware } from "hono/factory";
import type { Env, Variables, UserPlan } from "../types/env";
import { UsageRepository } from "../modules/usage";

// Quota limits by plan
const QUOTA_LIMITS = {
  free: {
    analyze: 3,
    compare: 0,
  },
  premium: {
    analyze: Infinity,
    compare: Infinity,
  },
  b2b: {
    analyze: Infinity,
    compare: Infinity,
  },
} as const;

export type QuotaType = "analyze" | "compare";

export interface QuotaCheckResult {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
}

export function getQuotaLimit(plan: UserPlan, quotaType: QuotaType): number {
  return QUOTA_LIMITS[plan]?.[quotaType] ?? QUOTA_LIMITS.free[quotaType];
}

// Middleware to check daily quota before allowing the request
export function checkDailyQuota(quotaType: QuotaType) {
  return createMiddleware<{
    Bindings: Env;
    Variables: Variables;
  }>(async (c, next) => {
    const userId = c.get("userId");
    const userPlan = c.get("userPlan") || "free";

    if (!userId) {
      return c.json(
        { success: false, error: "Unauthorized", code: "AUTH_REQUIRED" },
        401
      );
    }

    const limit = getQuotaLimit(userPlan, quotaType);

    // Premium and B2B have unlimited access
    if (limit === Infinity) {
      return next();
    }

    const usageRepo = new UsageRepository(c.env.DATABASE_URL);
    const usage = await usageRepo.getUsageToday(userId);
    const used = quotaType === "analyze" ? usage.analyzeCount : usage.compareCount;

    if (used >= limit) {
      return c.json(
        {
          success: false,
          error: `Bạn đã hết lượt ${quotaType === "analyze" ? "phân tích" : "so sánh"} miễn phí hôm nay. Nâng cấp Premium để không giới hạn.`,
          code: "QUOTA_EXCEEDED",
          quota: {
            used,
            limit,
            remaining: 0,
            quotaType,
            plan: userPlan,
          },
        },
        403
      );
    }

    return next();
  });
}

// Middleware to require a minimum plan level
export function requirePlan(...allowedPlans: UserPlan[]) {
  return createMiddleware<{
    Bindings: Env;
    Variables: Variables;
  }>(async (c, next) => {
    const userPlan = c.get("userPlan") || "free";

    if (!allowedPlans.includes(userPlan)) {
      return c.json(
        {
          success: false,
          error: "Tính năng này yêu cầu gói Premium. Vui lòng nâng cấp để sử dụng.",
          code: "PLAN_REQUIRED",
          requiredPlans: allowedPlans,
          currentPlan: userPlan,
        },
        403
      );
    }

    return next();
  });
}
