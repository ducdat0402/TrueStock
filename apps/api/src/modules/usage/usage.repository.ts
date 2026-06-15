import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../../db/client";
import { usageDaily } from "../../db/schema";

export class UsageRepository {
  constructor(private databaseUrl: string) {}

  private get db() {
    return getDb(this.databaseUrl);
  }

  private getTodayDate(): string {
    // Reset quota at midnight Vietnam time
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
  }

  async getUsageToday(userId: string): Promise<{ analyzeCount: number; compareCount: number }> {
    const today = this.getTodayDate();

    const rows = await this.db
      .select()
      .from(usageDaily)
      .where(and(eq(usageDaily.userId, userId), eq(usageDaily.date, today)))
      .limit(1);

    if (rows[0]) {
      return {
        analyzeCount: rows[0].analyzeCount,
        compareCount: rows[0].compareCount,
      };
    }

    return { analyzeCount: 0, compareCount: 0 };
  }

  async incrementAnalyzeCount(userId: string): Promise<void> {
    const today = this.getTodayDate();

    await this.db
      .insert(usageDaily)
      .values({
        userId,
        date: today,
        analyzeCount: 1,
        compareCount: 0,
      })
      .onConflictDoUpdate({
        target: [usageDaily.userId, usageDaily.date],
        set: {
          analyzeCount: sql`${usageDaily.analyzeCount} + 1`,
        },
      });
  }

  async incrementCompareCount(userId: string): Promise<void> {
    const today = this.getTodayDate();

    await this.db
      .insert(usageDaily)
      .values({
        userId,
        date: today,
        analyzeCount: 0,
        compareCount: 1,
      })
      .onConflictDoUpdate({
        target: [usageDaily.userId, usageDaily.date],
        set: {
          compareCount: sql`${usageDaily.compareCount} + 1`,
        },
      });
  }
}
