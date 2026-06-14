import { useAuth } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import type { AnalysisResult } from "@truestock/types";
import { analyzeStock } from "../lib/api";

interface UseAnalysisResult {
  data: AnalysisResult | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

export function useAnalysis(ticker: string | undefined): UseAnalysisResult {
  const { getToken, isSignedIn } = useAuth();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const fetchAnalysis = useCallback(async () => {
    if (!ticker) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const token = isSignedIn ? await getToken() : null;
      const result = await analyzeStock(ticker, token);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể phân tích cổ phiếu");
    } finally {
      setLoading(false);
    }
  }, [ticker, isSignedIn, getToken]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { data, loading, error, retry };
}
