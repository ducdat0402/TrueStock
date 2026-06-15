import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import type { AlertItem } from "@truestock/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

interface UseAlertsReturn {
  alerts: AlertItem[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  isPremiumRequired: boolean;
  refetch: () => Promise<void>;
  markAsRead: (alertId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function useAlerts(): UseAlertsReturn {
  const { getToken, isSignedIn } = useAuth();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
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
      setAlerts([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    setError(null);
    setIsPremiumRequired(false);

    try {
      const response = await fetchWithAuth("/api/alerts");
      const json = await response.json();

      if (!response.ok || !json.success) {
        // Check if this is a premium-required error
        if (json.code === "PLAN_REQUIRED" || response.status === 403) {
          setIsPremiumRequired(true);
          setAlerts([]);
          setUnreadCount(0);
          return;
        }
        throw new Error(json.error || "Failed to fetch alerts");
      }

      setAlerts(json.data.alerts);
      setUnreadCount(json.data.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, fetchWithAuth]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const markAsRead = useCallback(
    async (alertId: string) => {
      if (!isSignedIn) return;

      try {
        await fetchWithAuth(`/api/alerts/${alertId}/read`, { method: "PATCH" });
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    },
    [isSignedIn, fetchWithAuth]
  );

  const markAllAsRead = useCallback(async () => {
    if (!isSignedIn) return;

    try {
      await fetchWithAuth("/api/alerts/read-all", { method: "PATCH" });
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [isSignedIn, fetchWithAuth]);

  return {
    alerts,
    unreadCount,
    loading,
    error,
    isPremiumRequired,
    refetch,
    markAsRead,
    markAllAsRead,
  };
}
