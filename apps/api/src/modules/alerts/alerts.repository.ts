import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, desc, sql } from "drizzle-orm";
import { alertLog, userAlertPrefs } from "../../db/schema";
import type { AlertItem, AlertPreferences } from "@truestock/types";

export class AlertsRepository {
  private db;

  constructor(databaseUrl: string) {
    const client = neon(databaseUrl);
    this.db = drizzle(client);
  }

  async findAlertsByUserId(
    userId: string,
    limit = 20
  ): Promise<AlertItem[]> {
    const rows = await this.db
      .select({
        id: alertLog.id,
        ticker: alertLog.ticker,
        oldScore: alertLog.oldScore,
        newScore: alertLog.newScore,
        channel: alertLog.channel,
        isRead: alertLog.isRead,
        sentAt: alertLog.sentAt,
      })
      .from(alertLog)
      .where(eq(alertLog.userId, userId))
      .orderBy(desc(alertLog.sentAt))
      .limit(limit);

    return rows.map((row) => ({
      id: row.id,
      ticker: row.ticker,
      oldScore: row.oldScore ? Number(row.oldScore) : 0,
      newScore: row.newScore ? Number(row.newScore) : 0,
      channel: row.channel as "in_app" | "email",
      isRead: row.isRead === "true",
      sentAt: row.sentAt?.toISOString() ?? new Date().toISOString(),
    }));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(alertLog)
      .where(and(eq(alertLog.userId, userId), eq(alertLog.isRead, "false")));

    return result[0]?.count ?? 0;
  }

  async markAsRead(userId: string, alertId: string): Promise<void> {
    await this.db
      .update(alertLog)
      .set({ isRead: "true" })
      .where(and(eq(alertLog.id, alertId), eq(alertLog.userId, userId)));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.db
      .update(alertLog)
      .set({ isRead: "true" })
      .where(eq(alertLog.userId, userId));
  }

  async createAlert(
    userId: string,
    ticker: string,
    oldScore: number,
    newScore: number,
    channel: "in_app" | "email"
  ): Promise<void> {
    await this.db.insert(alertLog).values({
      userId,
      ticker: ticker.toUpperCase(),
      oldScore: oldScore.toString(),
      newScore: newScore.toString(),
      channel,
      isRead: "false",
    });
  }

  async getPreferences(userId: string): Promise<AlertPreferences> {
    const rows = await this.db
      .select()
      .from(userAlertPrefs)
      .where(eq(userAlertPrefs.userId, userId))
      .limit(1);

    if (rows.length === 0) {
      return { emailEnabled: false, threshold: 1.0 };
    }

    const row = rows[0];
    return {
      emailEnabled: row.emailEnabled === "true",
      threshold: row.threshold ? Number(row.threshold) : 1.0,
    };
  }

  async updatePreferences(
    userId: string,
    prefs: Partial<AlertPreferences>
  ): Promise<void> {
    const values: Record<string, string> = {};
    if (prefs.emailEnabled !== undefined) {
      values.emailEnabled = prefs.emailEnabled ? "true" : "false";
    }
    if (prefs.threshold !== undefined) {
      values.threshold = prefs.threshold.toString();
    }

    await this.db
      .insert(userAlertPrefs)
      .values({
        userId,
        ...values,
      })
      .onConflictDoUpdate({
        target: userAlertPrefs.userId,
        set: values,
      });
  }
}
