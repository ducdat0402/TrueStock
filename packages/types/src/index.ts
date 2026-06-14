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
}

// Request body cho POST /api/analyze
export interface AnalyzeRequest {
  ticker: string;
}

// Search history item
export interface SearchHistoryItem {
  id: string;
  ticker: string;
  companyName?: string;
  healthScore?: number;
  searchedAt: string;
}

// User info
export interface UserInfo {
  id: string;
  clerkId: string;
  email?: string;
  createdAt: string;
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
