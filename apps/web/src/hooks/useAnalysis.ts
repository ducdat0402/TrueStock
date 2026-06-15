import { useAuth } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import type { AnalysisResult } from "@truestock/types";
import { analyzeStock, AuthRequiredError, QuotaExceededError } from "../lib/api";

export type AnalysisErrorType = "auth_required" | "quota_exceeded" | "generic";

interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  plan: string;
}

interface UseAnalysisResult {
  data: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  errorType: AnalysisErrorType | null;
  quotaInfo: QuotaInfo | null;
  retry: () => void;
}

export function useAnalysis(ticker: string | undefined): UseAnalysisResult {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<AnalysisErrorType | null>(null);
  const [quotaInfo, setQuotaInfo] = useState<QuotaInfo | null>(null);
  const [attempt, setAttempt] = useState(0);

  const fetchAnalysis = useCallback(async () => {
    if (!ticker || !isLoaded) return;

    setLoading(true);
    setError(null);
    setErrorType(null);
    setQuotaInfo(null);
    setData(null);

    try {
      const token = isSignedIn ? await getToken() : null;
      const result = await analyzeStock(ticker, token);
      setData(result);
      window.dispatchEvent(new Event("truestock:refresh-me"));
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        setError(err.message);
        setErrorType("auth_required");
      } else if (err instanceof QuotaExceededError) {
        setError(err.message);
        setErrorType("quota_exceeded");
        setQuotaInfo(err.quota);
      } else {
        setError(err instanceof Error ? err.message : "Không thể phân tích cổ phiếu");
        setErrorType("generic");
      }
    } finally {
      setLoading(false);
    }
  }, [ticker, isSignedIn, isLoaded, getToken]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { data, loading, error, errorType, quotaInfo, retry };
}
