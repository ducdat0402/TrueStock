import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import type { ComparisonResult, ComparisonStock } from "@truestock/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

function getScoreColor(score: number): string {
  if (score >= 7) return "text-green-600";
  if (score >= 5) return "text-amber-600";
  return "text-red-600";
}

function getScoreBg(score: number): string {
  if (score >= 7) return "bg-green-50 border-green-200";
  if (score >= 5) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

function SubScoreRow({
  label,
  stocks,
  field,
}: {
  label: string;
  stocks: ComparisonStock[];
  field: keyof ComparisonStock["subScores"];
}) {
  const scores = stocks.map((s) => s.subScores[field]);
  const maxScore = Math.max(...scores.map((s) => s.score));

  return (
    <tr className="border-b border-slate-100">
      <td className="py-3 pr-4 text-sm font-medium text-slate-700">{label}</td>
      {scores.map((score, i) => (
        <td key={i} className="py-3 px-2 text-center">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-sm font-semibold ${
              score.score === maxScore
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {score.score}
            {score.score === maxScore && stocks.length > 1 && " ⭐"}
          </span>
        </td>
      ))}
    </tr>
  );
}

function CompareResultView({ result }: { result: ComparisonResult }) {
  const { stocks, recommendation, bestFor } = result;

  return (
    <div className="space-y-6">
      {/* Score comparison header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${stocks.length}, 1fr)` }}>
        {stocks.map((stock) => (
          <div
            key={stock.ticker}
            className={`rounded-2xl border p-4 text-center ${getScoreBg(stock.healthScore)}`}
          >
            <Link
              to={`/analyze/${stock.ticker}`}
              className="text-lg font-bold text-navy hover:text-teal transition"
            >
              {stock.ticker}
            </Link>
            <p className="mt-1 text-sm text-slate-500">{stock.companyName}</p>
            <p className={`mt-3 text-4xl font-bold ${getScoreColor(stock.healthScore)}`}>
              {stock.healthScore}
              <span className="text-lg font-normal text-slate-400">/10</span>
            </p>
          </div>
        ))}
      </div>

      {/* Sub-scores comparison table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="py-3 px-4 text-left text-sm font-semibold text-slate-700">
                Tiêu chí
              </th>
              {stocks.map((s) => (
                <th key={s.ticker} className="py-3 px-2 text-center text-sm font-semibold text-slate-700">
                  {s.ticker}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SubScoreRow label="Khả năng sinh lời" stocks={stocks} field="profitability" />
            <SubScoreRow label="Mức độ an toàn" stocks={stocks} field="safety" />
            <SubScoreRow label="Tăng trưởng" stocks={stocks} field="growth" />
            <SubScoreRow label="Định giá" stocks={stocks} field="valuation" />
          </tbody>
        </table>
      </div>

      {/* Highlights */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${stocks.length}, 1fr)` }}>
        {stocks.map((stock) => (
          <div key={stock.ticker} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h4 className="font-semibold text-navy">{stock.ticker} - Điểm nổi bật</h4>
            <ul className="mt-3 space-y-2">
              {stock.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-0.5 text-teal">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Recommendation */}
      <div className="rounded-2xl border border-teal/20 bg-gradient-to-r from-teal-50 to-white p-5">
        <h3 className="flex items-center gap-2 font-semibold text-navy">
          <span className="text-xl">💡</span> Nhận xét tổng quan
        </h3>
        <p className="mt-2 text-slate-700">{recommendation}</p>
      </div>

      {/* Best for */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
          <h4 className="flex items-center gap-2 font-semibold text-blue-800">
            <span>🛡️</span> Nhà đầu tư thận trọng
          </h4>
          <p className="mt-2 text-sm text-blue-700">{bestFor.conservative}</p>
        </div>
        <div className="rounded-2xl border border-green-100 bg-green-50/50 p-4">
          <h4 className="flex items-center gap-2 font-semibold text-green-800">
            <span>🚀</span> Ưu tiên tăng trưởng
          </h4>
          <p className="mt-2 text-sm text-green-700">{bestFor.growth}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
          <h4 className="flex items-center gap-2 font-semibold text-amber-800">
            <span>💰</span> Ưu tiên cổ tức
          </h4>
          <p className="mt-2 text-sm text-amber-700">{bestFor.dividend}</p>
        </div>
      </div>
    </div>
  );
}

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tickersParam = searchParams.get("tickers") || "";
  
  const [inputTickers, setInputTickers] = useState(tickersParam);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    const tickers = inputTickers
      .split(/[\s,]+/)
      .map((t) => t.trim().toUpperCase())
      .filter((t) => t.length > 0);

    if (tickers.length < 2) {
      setError("Vui lòng nhập ít nhất 2 mã cổ phiếu");
      return;
    }
    if (tickers.length > 3) {
      setError("Chỉ hỗ trợ tối đa 3 mã cổ phiếu");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickers }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || "Có lỗi xảy ra");
      }

      setResult(json.data);
      setSearchParams({ tickers: tickers.join(",") });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">So sánh cổ phiếu</h1>
        <p className="mt-2 text-slate-500">
          Nhập 2-3 mã cổ phiếu để so sánh song song
        </p>
      </div>

      {/* Input form */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={inputTickers}
          onChange={(e) => setInputTickers(e.target.value)}
          placeholder="VD: FPT, MWG, VNM"
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-center text-lg focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/20"
          onKeyDown={(e) => e.key === "Enter" && handleCompare()}
        />
        <button
          onClick={handleCompare}
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-teal to-teal-dark px-8 py-3 font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-50"
        >
          {loading ? "Đang so sánh..." : "So sánh"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-10 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal border-t-transparent" />
          <p className="mt-4 text-slate-500">Đang phân tích và so sánh...</p>
          <p className="mt-1 text-sm text-slate-400">
            Quá trình này có thể mất 10-20 giây
          </p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="mt-8">
          <CompareResultView result={result} />
        </div>
      )}

      {/* Disclaimer */}
      <p className="mt-8 text-center text-xs text-slate-400">
        ⚠️ Mỗi lần so sánh mới sẽ sử dụng 1 lần gọi AI. Kết quả được cache 24 giờ.
      </p>
    </div>
  );
}
