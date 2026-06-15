import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, sql } from "drizzle-orm";
import { watchlist, alertLog, userAlertPrefs, users } from "../db/schema";
import { fetchFinancialDataFromCafeF } from "../services/financial/cafef-financial";
import { calculateHealthScore } from "../services/scoring/health-score.engine";
import { ResendService } from "../services/email/resend.service";

interface WatchlistCheckEnv {
  DATABASE_URL: string;
  RESEND_API_KEY?: string;
  FRONTEND_URL?: string;
}

interface WatchlistItem {
  id: string;
  userId: string;
  ticker: string;
  lastScore: string | null;
}

interface UserPrefs {
  userId: string;
  email: string | null;
  threshold: number;
  emailEnabled: boolean;
}

async function getUserPrefs(
  db: ReturnType<typeof drizzle>,
  userIds: string[]
): Promise<Map<string, UserPrefs>> {
  if (userIds.length === 0) return new Map();

  // Get user preferences joined with user email
  const prefsWithEmail = await db
    .select({
      userId: users.id,
      email: users.email,
      threshold: userAlertPrefs.threshold,
      emailEnabled: userAlertPrefs.emailEnabled,
    })
    .from(users)
    .leftJoin(userAlertPrefs, eq(users.id, userAlertPrefs.userId))
    .where(sql`${users.id} = ANY(${userIds})`);

  const prefsMap = new Map<string, UserPrefs>();
  for (const p of prefsWithEmail) {
    prefsMap.set(p.userId, {
      userId: p.userId,
      email: p.email,
      threshold: p.threshold ? Number(p.threshold) : 1.0,
      emailEnabled: p.emailEnabled === "true",
    });
  }

  // Default prefs for users without custom settings
  for (const userId of userIds) {
    if (!prefsMap.has(userId)) {
      prefsMap.set(userId, {
        userId,
        email: null,
        threshold: 1.0,
        emailEnabled: false,
      });
    }
  }

  return prefsMap;
}

async function calculateCurrentScore(ticker: string): Promise<number | null> {
  try {
    const data = await fetchFinancialDataFromCafeF(ticker);
    if (!data) return null;
    const { healthScore } = calculateHealthScore(data);
    return healthScore;
  } catch {
    return null;
  }
}

export async function runWatchlistCheck(env: WatchlistCheckEnv): Promise<{
  checked: number;
  alerts: number;
  emails: number;
}> {
  const client = neon(env.DATABASE_URL);
  const db = drizzle(client);
  const emailService = new ResendService(env.RESEND_API_KEY, env.FRONTEND_URL || "");

  // Get all watchlist items
  const items: WatchlistItem[] = await db
    .select({
      id: watchlist.id,
      userId: watchlist.userId,
      ticker: watchlist.ticker,
      lastScore: watchlist.lastScore,
    })
    .from(watchlist);

  if (items.length === 0) {
    return { checked: 0, alerts: 0, emails: 0 };
  }

  // Get unique user IDs and their preferences
  const userIds = [...new Set(items.map((i) => i.userId))];
  const userPrefs = await getUserPrefs(db, userIds);

  // Group items by ticker to minimize API calls
  const tickerMap = new Map<string, WatchlistItem[]>();
  for (const item of items) {
    const existing = tickerMap.get(item.ticker) || [];
    existing.push(item);
    tickerMap.set(item.ticker, existing);
  }

  let alertsCreated = 0;
  let emailsSent = 0;

  // Track sent emails to avoid duplicates per user per day
  const emailsSentToday = new Map<string, Set<string>>();

  // Process each ticker
  for (const [ticker, tickerItems] of tickerMap) {
    const newScore = await calculateCurrentScore(ticker);
    if (newScore === null) continue;

    // Update watchlist items and create alerts if needed
    for (const item of tickerItems) {
      const oldScore = item.lastScore ? Number(item.lastScore) : null;
      const prefs = userPrefs.get(item.userId)!;
      const threshold = prefs.threshold;

      // Update the watchlist item score
      await db
        .update(watchlist)
        .set({
          lastScore: newScore.toString(),
          lastCheckedAt: new Date(),
        })
        .where(eq(watchlist.id, item.id));

      // Create alert if score changed significantly
      if (oldScore !== null && Math.abs(newScore - oldScore) >= threshold) {
        // Always create in-app alert
        await db.insert(alertLog).values({
          userId: item.userId,
          ticker,
          oldScore: oldScore.toString(),
          newScore: newScore.toString(),
          channel: "in_app",
          isRead: "false",
        });
        alertsCreated++;

        // Send email if enabled and user has email
        if (prefs.emailEnabled && prefs.email) {
          // Check if we already sent email for this ticker today
          const userSent = emailsSentToday.get(item.userId) || new Set();
          if (!userSent.has(ticker)) {
            const result = await emailService.sendAlertEmail(
              prefs.email,
              ticker,
              oldScore,
              newScore
            );

            if (result.success) {
              emailsSent++;
              userSent.add(ticker);
              emailsSentToday.set(item.userId, userSent);

              // Log email alert
              await db.insert(alertLog).values({
                userId: item.userId,
                ticker,
                oldScore: oldScore.toString(),
                newScore: newScore.toString(),
                channel: "email",
                isRead: "true",
              });
            }
          }
        }
      }
    }
  }

  return { checked: items.length, alerts: alertsCreated, emails: emailsSent };
}
