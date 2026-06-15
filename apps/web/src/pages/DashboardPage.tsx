import { useAuth, useUser } from "@clerk/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { SearchHistoryItem } from "@truestock/types";
import { getSearchHistory } from "../lib/api";
import { ScoreBadge } from "../components/ui/ScoreBadge";
import { HistorySkeleton } from "../components/ui/Skeleton";
import { useWatchlist } from "../hooks/useWatchlist";
import { useAlertPreferences } from "../hooks/useAlertPreferences";
import { useAlerts } from "../hooks/useAlerts";

type TabId = "watchlist" | "history" | "alerts";

export function DashboardPage() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabId>("watchlist");
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const {
    items: watchlistItems,
    loading: watchlistLoading,
    error: watchlistError,
    removeFromWatchlist,
  } = useWatchlist();

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = await getToken();
        if (!token) {
          setHistoryError("Không thể lấy token xác thực");
          return;
        }
        const data = await getSearchHistory(token);
        setHistory(data);
      } catch (err) {
        setHistoryError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setHistoryLoading(false);
      }
    }

    loadHistory();
  }, [getToken]);

  const displayName =
    user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? "bạn";

  const handleRemoveFromWatchlist = async (ticker: string) => {
    await removeFromWatchlist(ticker);
  };

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
              Theo dõi và quản lý cổ phiếu của bạn
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("watchlist")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === "watchlist"
              ? "border-teal text-teal"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>⭐</span>
          <span>Watchlist</span>
          {watchlistItems.length > 0 && (
            <span className="rounded-full bg-teal/10 px-2 py-0.5 text-xs text-teal">
              {watchlistItems.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === "history"
              ? "border-teal text-teal"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>🕒</span>
          <span>Lịch sử</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("alerts")}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition ${
            activeTab === "alerts"
              ? "border-teal text-teal"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <span>⚙️</span>
          <span>Cài đặt</span>
        </button>
      </div>

      {/* Watchlist Tab */}
      {activeTab === "watchlist" && (
        <section className="card p-4 sm:p-6">
          <h2 className="text-base font-semibold text-navy sm:text-lg">
            Mã cổ phiếu theo dõi
          </h2>

          {watchlistLoading && <HistorySkeleton />}

          {watchlistError && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {watchlistError}
            </div>
          )}

          {!watchlistLoading && !watchlistError && watchlistItems.length === 0 && (
            <div className="mt-5 rounded-xl border border-dashed border-slate-200 py-8 text-center sm:mt-6 sm:py-10">
              <p className="text-slate-500">Chưa có mã nào trong watchlist.</p>
              <Link
                to="/"
                className="mt-3 inline-block rounded-xl bg-teal px-5 py-2 text-sm font-semibold text-white transition hover:bg-teal-light"
              >
                Phân tích và thêm mã
              </Link>
            </div>
          )}

          {!watchlistLoading && watchlistItems.length > 0 && (
            <ul className="mt-4 divide-y divide-slate-100">
              {watchlistItems.map((item) => (
                <li key={item.id}>
                  <div className="-mx-1 flex flex-col gap-3 rounded-xl px-1 py-4 sm:-mx-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-2">
                    <Link
                      to={`/analyze/${item.ticker}`}
                      className="flex min-w-0 flex-1 items-center gap-3 transition hover:opacity-80"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-sm font-bold text-amber-700 sm:h-11 sm:w-11">
                        {item.ticker}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-navy">{item.ticker}</p>
                        {item.lastScore != null && (
                          <p className="text-sm text-slate-500">
                            Điểm: {item.lastScore}/10
                          </p>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center justify-between gap-3 pl-[52px] sm:shrink-0 sm:justify-end sm:pl-0">
                      {item.lastScore != null && (
                        <ScoreBadge score={item.lastScore} size="md" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFromWatchlist(item.ticker)}
                        className="rounded-lg px-3 py-1.5 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <section className="card p-4 sm:p-6">
          <h2 className="text-base font-semibold text-navy sm:text-lg">
            Lịch sử tìm kiếm
          </h2>

          {historyLoading && <HistorySkeleton />}

          {historyError && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {historyError}
            </div>
          )}

          {!historyLoading && !historyError && history.length === 0 && (
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

          {!historyLoading && history.length > 0 && (
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
      )}

      {/* Alerts & Settings Tab */}
      {activeTab === "alerts" && <AlertsSettingsSection />}
    </div>
  );
}

function AlertsSettingsSection() {
  const { preferences, loading: prefsLoading, updatePreferences } = useAlertPreferences();
  const { alerts, loading: alertsLoading, markAllAsRead } = useAlerts();
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [threshold, setThreshold] = useState(1.0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.emailEnabled);
      setThreshold(preferences.threshold);
    }
  }, [preferences]);

  const handleSave = async () => {
    setSaving(true);
    await updatePreferences({ emailEnabled, threshold });
    setSaving(false);
  };

  return (
    <div className="space-y-5">
      {/* Settings Card */}
      <section className="card p-4 sm:p-6">
        <h2 className="text-base font-semibold text-navy sm:text-lg">
          Cài đặt thông báo
        </h2>

        {prefsLoading ? (
          <div className="mt-4 animate-pulse space-y-4">
            <div className="h-12 rounded-lg bg-slate-100" />
            <div className="h-12 rounded-lg bg-slate-100" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Email toggle */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <p className="font-medium text-navy">Nhận email thông báo</p>
                <p className="text-sm text-slate-500">
                  Gửi email khi điểm sức khỏe thay đổi đáng kể
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailEnabled(!emailEnabled)}
                className={`relative h-6 w-11 rounded-full transition ${
                  emailEnabled ? "bg-teal" : "bg-slate-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    emailEnabled ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Threshold slider */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-navy">Ngưỡng thông báo</p>
                  <p className="text-sm text-slate-500">
                    Chỉ thông báo khi điểm thay đổi ít nhất
                  </p>
                </div>
                <span className="rounded-lg bg-teal/10 px-3 py-1 font-semibold text-teal">
                  {threshold.toFixed(1)} điểm
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.5"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="mt-3 w-full accent-teal"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>0.5</span>
                <span>3.0</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-teal px-4 py-3 font-semibold text-white transition hover:bg-teal-dark disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu cài đặt"}
            </button>
          </div>
        )}
      </section>

      {/* Alert History Card */}
      <section className="card p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-navy sm:text-lg">
            Lịch sử thông báo
          </h2>
          {alerts.length > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-sm text-teal hover:underline"
            >
              Đánh dấu đã đọc tất cả
            </button>
          )}
        </div>

        {alertsLoading ? (
          <div className="mt-4 animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-slate-100" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-200 py-8 text-center">
            <p className="text-slate-500">Chưa có thông báo nào.</p>
          </div>
        ) : (
          <ul className="mt-4 space-y-2">
            {alerts.map((alert) => {
              const delta = alert.newScore - alert.oldScore;
              const isPositive = delta > 0;
              return (
                <li
                  key={alert.id}
                  className={`rounded-xl border p-3 ${
                    alert.isRead
                      ? "border-slate-100 bg-white"
                      : "border-teal/30 bg-teal/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/analyze/${alert.ticker}`}
                        className="font-semibold text-navy hover:text-teal"
                      >
                        {alert.ticker}
                      </Link>
                      <span
                        className={`text-sm font-medium ${
                          isPositive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {alert.oldScore} → {alert.newScore} (
                        {isPositive ? "+" : ""}
                        {delta.toFixed(1)})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{alert.channel === "email" ? "📧" : "📱"}</span>
                      <span>
                        {new Date(alert.sentAt).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
