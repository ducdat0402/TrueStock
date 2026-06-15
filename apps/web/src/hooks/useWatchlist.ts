import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import type { WatchlistItem } from "@truestock/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

interface UseWatchlistReturn {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
  isPremiumRequired: boolean;
  refetch: () => Promise<void>;
  isInWatchlist: (ticker: string) => boolean;
  addToWatchlist: (ticker: string, score?: number) => Promise<boolean>;
  removeFromWatchlist: (ticker: string) => Promise<boolean>;
}

export function useWatchlist(): UseWatchlistReturn {
  const { getToken, isSignedIn } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPremiumRequired, setIsPremiumRequired] = useState(false);

  const fetchWithAuth = useCallback(
    async (path: string, options?: RequestInit) => {
      const token = await getToken();
      return fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
          ...options?.headers,
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
    },
    [getToken]
  );

  const refetch = useCallback(async () => {
    if (!isSignedIn) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    setIsPremiumRequired(false);

    try {
      const response = await fetchWithAuth("/api/watchlist");
      const json = await response.json();

      if (!response.ok || !json.success) {
        // Check if this is a premium-required error
        if (json.code === "PLAN_REQUIRED" || response.status === 403) {
          setIsPremiumRequired(true);
          setItems([]);
          return;
        }
        throw new Error(json.error || "Failed to fetch watchlist");
      }

      setItems(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, fetchWithAuth]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const isInWatchlist = useCallback(
    (ticker: string) => {
      return items.some(
        (item) => item.ticker.toUpperCase() === ticker.toUpperCase()
      );
    },
    [items]
  );

  const addToWatchlist = useCallback(
    async (ticker: string, score?: number): Promise<boolean> => {
      if (!isSignedIn) return false;

      try {
        const response = await fetchWithAuth("/api/watchlist", {
          method: "POST",
          body: JSON.stringify({ ticker, score }),
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.error || "Failed to add to watchlist");
        }

        // Optimistically update local state
        setItems((prev) => {
          if (prev.some((i) => i.ticker.toUpperCase() === ticker.toUpperCase())) {
            return prev;
          }
          return [json.data, ...prev];
        });

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [isSignedIn, fetchWithAuth]
  );

  const removeFromWatchlist = useCallback(
    async (ticker: string): Promise<boolean> => {
      if (!isSignedIn) return false;

      try {
        const response = await fetchWithAuth(`/api/watchlist/${ticker}`, {
          method: "DELETE",
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.error || "Failed to remove from watchlist");
        }

        // Optimistically update local state
        setItems((prev) =>
          prev.filter((i) => i.ticker.toUpperCase() !== ticker.toUpperCase())
        );

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [isSignedIn, fetchWithAuth]
  );

  return {
    items,
    loading,
    error,
    isPremiumRequired,
    refetch,
    isInWatchlist,
    addToWatchlist,
    removeFromWatchlist,
  };
}
