import { Link } from "react-router-dom";
import { SignInButton } from "@clerk/react";
import type { AnalysisErrorType } from "../../hooks/useAnalysis";

interface QuotaInfo {
  used: number;
  limit: number;
  plan: string;
}

interface AnalysisErrorProps {
  message: string;
  ticker?: string;
  onRetry?: () => void;
  errorType?: AnalysisErrorType | null;
  quotaInfo?: QuotaInfo | null;
}

export function AnalysisError({
  message,
  ticker,
  onRetry,
  errorType,
  quotaInfo,
}: AnalysisErrorProps) {
  const isNotFound = message.includes("Không tìm thấy mã cổ phiếu");
  const isAuthRequired = errorType === "auth_required";
  const isQuotaExceeded = errorType === "quota_exceeded";

  // Auth required UI
  if (isAuthRequired) {
    return (
      <div className="card mx-auto max-w-lg border-teal/30 bg-gradient-to-b from-teal/10 to-white p-5 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal/20 text-xl sm:h-14 sm:w-14 sm:text-2xl">
          🔐
        </div>
        <p className="mt-4 text-base font-semibold text-navy sm:text-lg">
          Đăng nhập để phân tích
        </p>
        {ticker && (
          <p className="mt-1 text-sm font-medium text-slate-600">
            Mã: {ticker.toUpperCase()}
          </p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Vui lòng đăng nhập để sử dụng tính năng phân tích cổ phiếu. Tài khoản
          miễn phí được phân tích 3 mã/ngày.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <SignInButton mode="modal">
            <button
              type="button"
              className="w-full rounded-xl bg-teal px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-dark sm:w-auto"
            >
              Đăng nhập ngay
            </button>
          </SignInButton>
          <Link
            to="/"
            className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:w-auto"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Quota exceeded UI
  if (isQuotaExceeded && quotaInfo) {
    return (
      <div className="card mx-auto max-w-lg border-amber-300 bg-gradient-to-b from-amber-50 to-white p-5 text-center sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-xl sm:h-14 sm:w-14 sm:text-2xl">
          ⚡
        </div>
        <p className="mt-4 text-base font-semibold text-amber-800 sm:text-lg">
          Đã hết lượt phân tích hôm nay
        </p>
        {ticker && (
          <p className="mt-1 text-sm font-medium text-amber-700">
            Mã: {ticker.toUpperCase()}
          </p>
        )}
        <div className="mt-3 rounded-lg bg-amber-100/50 px-4 py-2">
          <p className="text-sm font-medium text-amber-800">
            Đã dùng: {quotaInfo.used}/{quotaInfo.limit} lượt
          </p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-amber-700">
          Nâng cấp lên Premium để phân tích không giới hạn, cùng nhiều tính năng
          cao cấp khác.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Link
            to="/pricing"
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-orange-600 sm:w-auto"
          >
            Nâng cấp Premium
          </Link>
          <Link
            to="/"
            className="w-full rounded-xl border border-amber-200 bg-white px-5 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-50 sm:w-auto"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  // Generic error UI
  return (
    <div className="card mx-auto max-w-lg border-red-200 bg-gradient-to-b from-red-50 to-white p-5 text-center sm:p-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-xl sm:h-14 sm:w-14 sm:text-2xl">
        ⚠️
      </div>
      <p className="mt-4 text-base font-semibold text-red-800 sm:text-lg">
        {isNotFound ? "Không tìm thấy mã cổ phiếu" : "Không thể phân tích"}
      </p>
      {ticker && (
        <p className="mt-1 text-sm font-medium text-red-600">
          Mã: {ticker.toUpperCase()}
        </p>
      )}
      <p className="mt-3 text-sm leading-relaxed text-red-600/90">{message}</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="w-full rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 sm:w-auto"
          >
            Thử lại
          </button>
        )}
        <Link
          to="/"
          className="w-full rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 sm:w-auto"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
