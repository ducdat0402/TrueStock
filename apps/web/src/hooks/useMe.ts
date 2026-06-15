import { useAuth } from "@clerk/react";
import { useCallback, useEffect, useState } from "react";
import type { MeResponse } from "@truestock/types";

const API_URL = import.meta.env.VITE_API_URL || "";

interface UseMeResult {
  data: MeResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMe(): UseMeResult {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [data, setData] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchCount, setFetchCount] = useState(0);

  const fetchMe = useCallback(async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Không thể tải thông tin người dùng");
      }

      setData(json.data as MeResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi không xác định");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [getToken, isSignedIn, isLoaded]);

  const refetch = useCallback(() => setFetchCount((n) => n + 1), []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe, fetchCount]);

  useEffect(() => {
    const handler = () => refetch();
    window.addEventListener("truestock:refresh-me", handler);
    return () => window.removeEventListener("truestock:refresh-me", handler);
  }, [refetch]);

  return { data, loading, error, refetch };
}
