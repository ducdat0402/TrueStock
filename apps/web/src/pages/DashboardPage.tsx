import { useAuth, useUser } from "@clerk/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { SearchHistoryItem } from "@truestock/types";
import { getSearchHistory } from "../lib/api";
import { ScoreBadge } from "../components/ui/ScoreBadge";
import { HistorySkeleton } from "../components/ui/Skeleton";

export function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = await getToken();
        if (!token) {
          setError("Không thể lấy token xác thực");
          return;
        }
        const data = await getSearchHistory(token);
        setHistory(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setLoading(false);
      }
    }

    loadHistory();
  }, [getToken]);

  const displayName =
    user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "bạn";

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="card overflow-hidden p-4 sm:p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {user?.imageUrl && (
            <img
              src={user.imageUrl}
              alt=""
              className="h-12 w-12 rounded-full ring-2 ring-teal/30 sm:h-14 sm:w-14"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-medium text-teal">Dashboard</p>
            <h1 className="truncate text-xl font-bold text-navy sm:text-2xl">
              Xin chào, {displayName}!
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Lịch sử phân tích cổ phiếu của bạn
            </p>
          </div>
        </div>
      </div>

      <section className="card p-4 sm:p-6">
        <h2 className="text-base font-semibold text-navy sm:text-lg">Lịch sử tìm kiếm</h2>

        {loading && <HistorySkeleton />}

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 py-8 text-center sm:mt-6 sm:py-10">
            <p className="text-slate-500">Chưa có lịch sử phân tích.</p>
            <Link
              to="/"
              className="mt-3 inline-block rounded-xl bg-teal px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-light"
            >
              Phân tích cổ phiếu đầu tiên
            </Link>
          </div>
        )}

        {!loading && history.length > 0 && (
          <ul className="mt-4 divide-y divide-slate-100">
            {history.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/analyze/${item.ticker}`}
                  className="-mx-1 flex flex-col gap-3 rounded-xl px-1 py-4 transition hover:bg-slate-50 sm:-mx-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-2"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy/5 text-sm font-bold text-navy sm:h-11 sm:w-11">
                      {item.ticker}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-navy">{item.ticker}</p>
                      {item.companyName && (
                        <p className="truncate text-sm text-slate-500">
                          {item.companyName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pl-[52px] sm:shrink-0 sm:justify-end sm:pl-0">
                    {item.healthScore != null && (
                      <ScoreBadge score={item.healthScore} size="md" />
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(item.searchedAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
