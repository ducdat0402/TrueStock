import { Link } from "react-router-dom";

interface AnalysisErrorProps {
  message: string;
  ticker?: string;
  onRetry?: () => void;
}

export function AnalysisError({ message, ticker, onRetry }: AnalysisErrorProps) {
  const isNotFound = message.includes("Không tìm thấy mã cổ phiếu");

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
