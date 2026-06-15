import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import type { AlertPreferences } from "@truestock/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

interface UseAlertPreferencesReturn {
  preferences: AlertPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (prefs: Partial<AlertPreferences>) => Promise<boolean>;
}

export function useAlertPreferences(): UseAlertPreferencesReturn {
  const { getToken, isSignedIn } = useAuth();
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!isSignedIn) {
      setPreferences(null);
      return;
    }

    async function loadPreferences() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetchWithAuth("/api/alerts/preferences");
        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.error || "Failed to load preferences");
        }

        setPreferences(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    loadPreferences();
  }, [isSignedIn, fetchWithAuth]);

  const updatePreferences = useCallback(
    async (prefs: Partial<AlertPreferences>): Promise<boolean> => {
      if (!isSignedIn) return false;

      try {
        const response = await fetchWithAuth("/api/alerts/preferences", {
          method: "PATCH",
          body: JSON.stringify(prefs),
        });

        const json = await response.json();

        if (!response.ok || !json.success) {
          throw new Error(json.error || "Failed to update preferences");
        }

        setPreferences(json.data);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        return false;
      }
    },
    [isSignedIn, fetchWithAuth]
  );

  return {
    preferences,
    loading,
    error,
    updatePreferences,
  };
}
