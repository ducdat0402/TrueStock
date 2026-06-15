/**
 * TrueStock shared types
 * Types dùng chung giữa frontend và backend
 */

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Sub-scores cho phân tích
export interface SubScore {
  score: number;
  label: string;
  color: "green" | "yellow" | "red";
}

export interface SubScores {
  profitability: SubScore;
  safety: SubScore;
  growth: SubScore;
  valuation: SubScore;
}

// Plain language answers
export interface PlainAnswers {
  isProfitable: string;
  isDebtSafe: string;
  isGrowing: string;
  isPriceReasonable: string;
  suitableFor: string;
}

// Risk alert từ rule-based engine
export interface RiskAlert {
  level: "info" | "warning";
  message: string;
}

// So sánh với ngành
export interface IndustryComparison {
  industryId: string;
  industryName: string;
  industryAvgScore: number;
  delta: number;
  peerCount: number;
  verdict: string;
}

// Lịch sử điểm sức khỏe theo quý
export interface HealthScoreHistoryItem {
  period: string;
  score: number;
}

// Kết quả phân tích cổ phiếu
export interface AnalysisResult {
  ticker: string;
  companyName: string;
  healthScore: number;
  subScores: SubScores;
  plainAnswers: PlainAnswers;
  summary: string;
  dataSource: string;
  analyzedAt: string;
  riskAlerts?: RiskAlert[];
  industryComparison?: IndustryComparison;
  healthScoreHistory?: HealthScoreHistoryItem[];
}

// Request body cho POST /api/analyze
export interface AnalyzeRequest {
  ticker: string;
}

// Comparison types for multi-stock analysis
export interface CompareRequest {
  tickers: string[];
}

export interface ComparisonStock {
  ticker: string;
  companyName: string;
  healthScore: number;
  subScores: SubScores;
  highlights: string[];
}

export interface ComparisonResult {
  stocks: ComparisonStock[];
  recommendation: string;
  bestFor: {
    conservative: string;
    growth: string;
    dividend: string;
  };
  comparedAt: string;
}

// Search history item
export interface SearchHistoryItem {
  id: string;
  ticker: string;
  companyName?: string;
  healthScore?: number;
  searchedAt: string;
}

// User plan types
export type UserPlan = "free" | "premium" | "b2b";

// User info
export interface UserInfo {
  id: string;
  clerkId: string;
  email?: string;
  plan: UserPlan;
  createdAt: string;
}

// User quota/usage info from /api/me
export interface UsageInfo {
  used: number;
  limit: number | "unlimited";
  remaining: number | "unlimited";
}

export interface UserFeatures {
  watchlist: boolean;
  alerts: boolean;
  insights: boolean;
  compare: boolean;
  maxCompareStocks: number;
}

export interface MeResponse {
  userId: string;
  clerkId: string;
  plan: UserPlan;
  usage: {
    analyze: UsageInfo;
    compare: UsageInfo;
  };
  features: UserFeatures;
}

// Watchlist item
export interface WatchlistItem {
  id: string;
  ticker: string;
  companyName?: string;
  lastScore?: number;
  lastCheckedAt?: string;
  createdAt: string;
}

// Alert item for in-app notifications
export interface AlertItem {
  id: string;
  ticker: string;
  oldScore: number;
  newScore: number;
  channel: "in_app" | "email";
  isRead: boolean;
  sentAt: string;
}

// User alert preferences
export interface AlertPreferences {
  emailEnabled: boolean;
  threshold: number;
}

// Dữ liệu tài chính dùng cho phân tích AI
export interface FinancialData {
  ticker: string;
  companyName: string;
  revenue: { year: number; value: number }[];
  netProfit: { year: number; value: number }[];
  netProfitMargin: number;
  totalDebt: number;
  totalEquity: number;
  debtToEquity: number;
  revenueGrowthYoY: number;
  peRatio: number;
  roe: number;
  dataSource: string;
}
