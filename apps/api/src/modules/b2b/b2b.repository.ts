import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../../db/client";
import { apiKeys, apiUsageLog, apiMonthlyUsage, type ApiKey } from "../../db/schema";

export class B2BRepository {
  constructor(private databaseUrl: string) {}

  private get db() {
    return getDb(this.databaseUrl);
  }

  // Hash API key using SHA-256
  private async hashApiKey(key: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(key);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    const keyHash = await this.hashApiKey(key);

    const rows = await this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.keyHash, keyHash))
      .limit(1);

    if (!rows[0]) return null;

    const apiKey = rows[0];

    // Check if key has expired
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return null;
    }

    return apiKey;
  }

  async createApiKey(
    orgId: string,
    orgName: string,
    options?: {
      tier?: string;
      rateLimit?: number;
      monthlyQuota?: number;
      expiresAt?: Date;
    }
  ): Promise<{ key: string; keyPrefix: string; id: string }> {
    // Generate a random API key
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const keyBody = Array.from(randomBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const key = `ts_${keyBody}`;
    const keyPrefix = key.slice(0, 12);

    const keyHash = await this.hashApiKey(key);

    const rows = await this.db
      .insert(apiKeys)
      .values({
        orgId,
        orgName,
        keyHash,
        keyPrefix,
        tier: options?.tier || "standard",
        rateLimit: options?.rateLimit || 100,
        monthlyQuota: options?.monthlyQuota || 1000,
        expiresAt: options?.expiresAt,
      })
      .returning();

    return {
      key,
      keyPrefix: rows[0].keyPrefix,
      id: rows[0].id,
    };
  }

  async getMonthlyUsage(apiKeyId: string, yearMonth: string): Promise<number> {
    const rows = await this.db
      .select()
      .from(apiMonthlyUsage)
      .where(
        and(
          eq(apiMonthlyUsage.apiKeyId, apiKeyId),
          eq(apiMonthlyUsage.yearMonth, yearMonth)
        )
      )
      .limit(1);

    return rows[0]?.callCount || 0;
  }

  async incrementUsage(
    apiKeyId: string,
    endpoint: string,
    ticker?: string,
    responseTimeMs?: number,
    statusCode?: number
  ): Promise<void> {
    const yearMonth = new Date().toISOString().slice(0, 7);

    // Log individual API call
    await this.db.insert(apiUsageLog).values({
      apiKeyId,
      endpoint,
      ticker,
      responseTimeMs,
      statusCode,
    });

    // Update monthly usage counter
    await this.db
      .insert(apiMonthlyUsage)
      .values({
        apiKeyId,
        yearMonth,
        callCount: 1,
      })
      .onConflictDoUpdate({
        target: [apiMonthlyUsage.apiKeyId, apiMonthlyUsage.yearMonth],
        set: {
          callCount: sql`${apiMonthlyUsage.callCount} + 1`,
          lastUpdated: new Date(),
        },
      });
  }

  async getApiKeysByOrg(orgId: string): Promise<ApiKey[]> {
    return this.db
      .select()
      .from(apiKeys)
      .where(eq(apiKeys.orgId, orgId));
  }

  async deactivateApiKey(keyId: string): Promise<void> {
    await this.db
      .update(apiKeys)
      .set({ isActive: "false" })
      .where(eq(apiKeys.id, keyId));
  }

  async getUsageStats(
    apiKeyId: string,
    months: number = 6
  ): Promise<{ yearMonth: string; callCount: number }[]> {
    const rows = await this.db
      .select({
        yearMonth: apiMonthlyUsage.yearMonth,
        callCount: apiMonthlyUsage.callCount,
      })
      .from(apiMonthlyUsage)
      .where(eq(apiMonthlyUsage.apiKeyId, apiKeyId))
      .orderBy(apiMonthlyUsage.yearMonth)
      .limit(months);

    return rows;
  }
}
