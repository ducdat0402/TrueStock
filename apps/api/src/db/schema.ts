import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  decimal,
  jsonb,
} from "drizzle-orm/pg-core";

// Bảng users - lưu thông tin user từ Clerk
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id", { length: 255 }).unique().notNull(),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// Export types cho TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Analysis = typeof analyses.$inferSelect;
export type NewAnalysis = typeof analyses.$inferInsert;

export type SearchHistory = typeof searchHistory.$inferSelect;
export type NewSearchHistory = typeof searchHistory.$inferInsert;
