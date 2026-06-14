import { useAuth } from "@clerk/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { SearchHistoryItem } from "@truestock/types";
import { getSearchHistory } from "../../lib/api";
import { ScoreBadge } from "../ui/ScoreBadge";
import { HistorySkeleton } from "../ui/Skeleton";

export function RecentSearches() {
  const { isSignedIn, getToken } = useAuth();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSignedIn) return;

    async function load() {
      setLoading(true);
      try {
        const token = await getToken();
        if (!token) return;
        const data = await getSearchHistory(token);
        setHistory(data.slice(0, 5));
      } catch {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [isSignedIn, getToken]);

  if (!isSignedIn) return null;

  return (
    <section className="card p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-navy sm:text-lg">Tìm kiếm gần đây</h2>
          <p className="mt-0.5 text-sm text-slate-500">Các mã bạn đã phân tích</p>
        </div>
        <Link
          to="/dashboard"
          className="w-fit rounded-lg bg-teal/10 px-3 py-1.5 text-sm font-medium text-teal-dark transition hover:bg-teal/20"
        >
          Xem tất cả →
        </Link>
      </div>

      {loading && <HistorySkeleton />}

      {!loading && history.length === 0 && (
        <div className="mt-5 rounded-xl border border-dashed border-slate-200 py-8 text-center sm:mt-6">
          <p className="text-sm text-slate-500">Bạn chưa phân tích mã nào.</p>
          <p className="mt-1 text-xs text-slate-400">Hãy thử FPT hoặc VNM ở trên!</p>
        </div>
      )}

      {!loading && history.length > 0 && (
        <ul className="mt-4 space-y-1">
          {history.map((item) => (
            <li key={item.id}>
              <Link
                to={`/analyze/${item.ticker}`}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-3 transition hover:bg-slate-50 sm:px-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy/10 to-teal/10 text-sm font-bold text-navy sm:h-11 sm:w-11">
                    {item.ticker}
                  </span>
                  <div className="min-w-0 text-left">
                    <p className="font-semibold text-navy">{item.ticker}</p>
                    {item.companyName && (
                      <p className="truncate text-xs text-slate-500 sm:text-sm">
                        {item.companyName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                  {item.healthScore != null && (
                    <ScoreBadge score={item.healthScore} />
                  )}
                  <span className="text-[11px] text-slate-400 sm:text-xs">
                    {new Date(item.searchedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
