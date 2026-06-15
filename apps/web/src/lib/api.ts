import type { AnalysisResult, ApiResponse, SearchHistoryItem, MeResponse } from "@truestock/types";

const API_URL = import.meta.env.VITE_API_URL || "";

// Custom error types for better handling in UI
export class AuthRequiredError extends Error {
  constructor() {
    super("Vui lòng đăng nhập để phân tích cổ phiếu");
    this.name = "AuthRequiredError";
  }
}

export class QuotaExceededError extends Error {
  public quota: { used: number; limit: number; remaining: number; plan: string };

  constructor(
    message: string,
    quota: { used: number; limit: number; remaining: number; plan: string }
  ) {
    super(message);
    this.name = "QuotaExceededError";
    this.quota = quota;
  }
}

function authHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

interface AnalyzeResponse extends ApiResponse<AnalysisResult> {
  code?: string;
  quota?: { used: number; limit: number; remaining: number; plan: string };
}

export async function analyzeStock(
  ticker: string,
  token?: string | null
): Promise<AnalysisResult> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ ticker }),
    });
  } catch {
    throw new Error(
      "Không kết nối được API. Hãy chạy backend: cd apps/api && pnpm dev"
    );
  }

  const json = (await response.json()) as AnalyzeResponse;

  if (!json.success || !json.data) {
    // Handle specific error codes
    if (json.code === "AUTH_REQUIRED" || response.status === 401) {
      throw new AuthRequiredError();
    }
    if (json.code === "QUOTA_EXCEEDED" && json.quota) {
      throw new QuotaExceededError(json.error ?? "Đã hết quota", json.quota);
    }
    throw new Error(json.error ?? "Không thể phân tích cổ phiếu");
  }

  return json.data;
}

export async function fetchMe(token: string): Promise<MeResponse> {
  const response = await fetch(`${API_URL}/api/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = (await response.json()) as ApiResponse<MeResponse>;

  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Không thể tải thông tin người dùng");
  }

  return json.data;
}

export async function getCachedAnalysis(ticker: string): Promise<AnalysisResult | null> {
  const response = await fetch(`${API_URL}/api/analyze/${ticker}`);
  const json = (await response.json()) as ApiResponse<AnalysisResult>;

  if (!json.success) return null;
  return json.data ?? null;
}

export async function getSearchHistory(token: string): Promise<SearchHistoryItem[]> {
  const response = await fetch(`${API_URL}/api/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const json = (await response.json()) as ApiResponse<SearchHistoryItem[]>;

  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Không thể tải lịch sử");
  }

  return json.data;
}
