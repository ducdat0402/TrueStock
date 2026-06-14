import type { AnalysisResult, ApiResponse, SearchHistoryItem } from "@truestock/types";

const API_URL = import.meta.env.VITE_API_URL || "";

function authHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
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

  const json = (await response.json()) as ApiResponse<AnalysisResult>;

  if (!json.success || !json.data) {
    throw new Error(json.error ?? "Không thể phân tích cổ phiếu");
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
