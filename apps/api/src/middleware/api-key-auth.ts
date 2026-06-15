import { createMiddleware } from "hono/factory";
import type { Env } from "../types/env";
import { B2BRepository } from "../modules/b2b/b2b.repository";

export interface ApiKeyVariables {
  apiKeyId: string;
  orgId: string;
  orgName: string;
  tier: string;
  rateLimit: number;
  monthlyQuota: number;
}

// Middleware to authenticate API requests using X-API-Key header
export const requireApiKey = createMiddleware<{
  Bindings: Env;
  Variables: ApiKeyVariables;
}>(async (c, next) => {
  const apiKey = c.req.header("X-API-Key");

  if (!apiKey) {
    return c.json(
      {
        success: false,
        error: "API key is required",
        code: "API_KEY_REQUIRED",
      },
      401
    );
  }

  // Validate API key format (should start with "ts_")
  if (!apiKey.startsWith("ts_")) {
    return c.json(
      {
        success: false,
        error: "Invalid API key format",
        code: "INVALID_API_KEY",
      },
      401
    );
  }

  const repo = new B2BRepository(c.env.DATABASE_URL);

  try {
    const keyData = await repo.validateApiKey(apiKey);

    if (!keyData) {
      return c.json(
        {
          success: false,
          error: "Invalid or expired API key",
          code: "INVALID_API_KEY",
        },
        401
      );
    }

    // Check if key is active
    if (keyData.isActive !== "true") {
      return c.json(
        {
          success: false,
          error: "API key has been deactivated",
          code: "API_KEY_DEACTIVATED",
        },
        403
      );
    }

    // Check monthly quota
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usage = await repo.getMonthlyUsage(keyData.id, currentMonth);

    if (usage >= keyData.monthlyQuota) {
      return c.json(
        {
          success: false,
          error: "Monthly API quota exceeded",
          code: "QUOTA_EXCEEDED",
          quota: {
            used: usage,
            limit: keyData.monthlyQuota,
            resetDate: `${currentMonth}-01`,
          },
        },
        429
      );
    }

    // Set variables for downstream handlers
    c.set("apiKeyId", keyData.id);
    c.set("orgId", keyData.orgId);
    c.set("orgName", keyData.orgName);
    c.set("tier", keyData.tier);
    c.set("rateLimit", keyData.rateLimit);
    c.set("monthlyQuota", keyData.monthlyQuota);

    return next();
  } catch (error) {
    console.error("API key validation error:", error);
    return c.json(
      {
        success: false,
        error: "Authentication failed",
        code: "AUTH_ERROR",
      },
      500
    );
  }
});
