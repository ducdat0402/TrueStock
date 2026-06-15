import { Link, useParams } from "react-router-dom";
import { AnalysisError } from "../components/analysis/AnalysisError";
import { AnalysisLoading } from "../components/analysis/AnalysisLoading";
import { AnalysisView } from "../components/analysis/AnalysisView";
import { useAnalysis } from "../hooks/useAnalysis";

export function AnalyzePage() {
  const { ticker } = useParams<{ ticker: string }>();
  const { data, loading, error, errorType, quotaInfo, retry } = useAnalysis(ticker);

  if (!ticker) {
    return <AnalysisError message="Không tìm thấy mã cổ phiếu trong URL" />;
  }

  if (loading) {
    return <AnalysisLoading ticker={ticker} />;
  }

  if (error || !data) {
    return (
      <AnalysisError
        message={error ?? "Không nhận được kết quả phân tích"}
        ticker={ticker}
        onRetry={errorType === "generic" ? retry : undefined}
        errorType={errorType}
        quotaInfo={quotaInfo}
      />
    );
  }

  return (
    <div className="space-y-8 sm:space-y-10">
      <AnalysisView result={data} />

      <div className="flex justify-center border-t border-slate-200 pt-6 sm:pt-8">
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-navy-light hover:shadow-lg sm:w-auto sm:px-8"
        >
          ← Phân tích mã khác
        </Link>
      </div>
    </div>
  );
}
