import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  decimal,
  jsonb,
  date,
  integer,
  unique,
} from "drizzle-orm/pg-core";

// Plan types for subscription
export type UserPlan = "free" | "premium" | "b2b";

// Bảng users - lưu thông tin user từ Clerk
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }),
  plan: varchar("plan", { length: 20 }).default("free").notNull(),
  planExpiresAt: timestamp("plan_expires_at"),
  clerkSubscriptionId: varchar("clerk_subscription_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bảng usage_daily - theo dõi quota sử dụng hàng ngày
export const usageDaily = pgTable(
  "usage_daily",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    date: date("date").notNull(),
    analyzeCount: integer("analyze_count").default(0).notNull(),
    compareCount: integer("compare_count").default(0).notNull(),
  },
  (table) => ({
    userDateUnique: unique().on(table.userId, table.date),
  })
);

// Bảng analyses - cache kết quả phân tích cổ phiếu
export const analyses = pgTable("analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  companyName: varchar("company_name", { length: 255 }),
  healthScore: decimal("health_score", { precision: 3, scale: 1 }),
  rawFinancialData: jsonb("raw_financial_data"),
  aiResult: jsonb("ai_result"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bảng search_history - lịch sử tìm kiếm của user
export const searchHistory = pgTable("search_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  analysisId: uuid("analysis_id").references(() => analyses.id),
  searchedAt: timestamp("searched_at").defaultNow(),
});

// Bảng comparisons - cache kết quả so sánh cổ phiếu
export const comparisons = pgTable("comparisons", {
  id: uuid("id").primaryKey().defaultRandom(),
  tickerKey: varchar("ticker_key", { length: 100 }).notNull().unique(),
  result: jsonb("result"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bảng watchlist - mã cổ phiếu theo dõi của user
export const watchlist = pgTable("watchlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  lastScore: decimal("last_score", { precision: 3, scale: 1 }),
  lastCheckedAt: timestamp("last_checked_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bảng alert_log - lịch sử cảnh báo thay đổi điểm
export const alertLog = pgTable("alert_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  oldScore: decimal("old_score", { precision: 3, scale: 1 }),
  newScore: decimal("new_score", { precision: 3, scale: 1 }),
  channel: varchar("channel", { length: 20 }).notNull(),
  isRead: varchar("is_read", { length: 5 }).default("false"),
  sentAt: timestamp("sent_at").defaultNow(),
});

// Bảng user_alert_prefs - cài đặt cảnh báo của user
export const userAlertPrefs = pgTable("user_alert_prefs", {
  userId: uuid("user_id").references(() => users.id).primaryKey(),
  emailEnabled: varchar("email_enabled", { length: 5 }).default("false"),
  threshold: decimal("threshold", { precision: 3, scale: 1 }).default("1.0"),
});

// Bảng uploads - lưu trữ file PDF BCTC được tải lên
export const uploads = pgTable("uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  ticker: varchar("ticker", { length: 20 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileKey: varchar("file_key", { length: 500 }).notNull(),
  fileSize: integer("file_size").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  extractedData: jsonb("extracted_data"),
  errorMessage: varchar("error_message", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// B2B API Keys
export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: varchar("org_id", { length: 255 }).notNull(),
  orgName: varchar("org_name", { length: 255 }).notNull(),
  keyHash: varchar("key_hash", { length: 255 }).notNull().unique(),
  keyPrefix: varchar("key_prefix", { length: 20 }).notNull(),
  tier: varchar("tier", { length: 20 }).default("standard").notNull(),
  rateLimit: integer("rate_limit").default(100).notNull(),
  monthlyQuota: integer("monthly_quota").default(1000).notNull(),
  isActive: varchar("is_active", { length: 5 }).default("true").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// B2B API Usage Log
export const apiUsageLog = pgTable("api_usage_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  apiKeyId: uuid("api_key_id").references(() => apiKeys.id).notNull(),
  endpoint: varchar("endpoint", { length: 100 }).notNull(),
  ticker: varchar("ticker", { length: 20 }),
  responseTimeMs: integer("response_time_ms"),
  statusCode: integer("status_code"),
  calledAt: timestamp("called_at").defaultNow(),
});

// B2B Monthly Usage Summary
export const apiMonthlyUsage = pgTable(
  "api_monthly_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    apiKeyId: uuid("api_key_id").references(() => apiKeys.id).notNull(),
    yearMonth: varchar("year_month", { length: 7 }).notNull(),
    callCount: integer("call_count").default(0).notNull(),
    lastUpdated: timestamp("last_updated").defaultNow(),
  },
  (table) => ({
    keyMonthUnique: unique().on(table.apiKeyId, table.yearMonth),
  })
);

// Export types cho TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type UsageDaily = typeof usageDaily.$inferSelect;
export type NewUsageDaily = typeof usageDaily.$inferInsert;

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;

export type SearchHistory = typeof searchHistory.$inferSelect;
export type NewSearchHistory = typeof searchHistory.$inferInsert;

export type Comparison = typeof comparisons.$inferSelect;
export type NewComparison = typeof comparisons.$inferInsert;

export type Watchlist = typeof watchlist.$inferSelect;
export type NewWatchlist = typeof watchlist.$inferInsert;

export type AlertLog = typeof alertLog.$inferSelect;
export type NewAlertLog = typeof alertLog.$inferInsert;

export type UserAlertPrefs = typeof userAlertPrefs.$inferSelect;
export type NewUserAlertPrefs = typeof userAlertPrefs.$inferInsert;

export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export type ApiUsageLog = typeof apiUsageLog.$inferSelect;
export type NewApiUsageLog = typeof apiUsageLog.$inferInsert;

export type ApiMonthlyUsage = typeof apiMonthlyUsage.$inferSelect;
export type NewApiMonthlyUsage = typeof apiMonthlyUsage.$inferInsert;
